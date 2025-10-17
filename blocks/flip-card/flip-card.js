import { createOptimizedPicture } from '../../scripts/aem.js';

function createStarRating(ratingText, maxRating = 5) {
    const match = ratingText.match(/(\d+(\.\d+)?)/);
    if (!match) return null;

    const score = parseFloat(match[1]);
    if (isNaN(score)) return null;

    const ratingContainer = document.createElement('div');
    ratingContainer.className = 'star-rating';
    ratingContainer.setAttribute('aria-label', `${score} out of ${maxRating} stars`);
    
    const starSVGPath = 'M12 17.27l6.18 3.73-1.64-7.03 5.46-4.73-7.19-.61L12 2.6l-2.77 6.13-7.19.61 5.46 4.73-1.64 7.03z';

    const getStarSVG = (path) => `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="star">
            <path d="${path}"/>
        </svg>
    `;

    for (let i = 1; i <= maxRating; i++) {
        const starWrapper = document.createElement('span');
        starWrapper.classList.add('star-wrapper');

        starWrapper.innerHTML = getStarSVG(starSVGPath); 
        
        let percentage = 0;
        const isFull = i <= Math.floor(score);
        const isPartial = i === Math.ceil(score) && score % 1 !== 0;

        if (isFull) {
            percentage = 100;
        } else if (isPartial) {
            percentage = (score - Math.floor(score)) * 100;
        }

        if (percentage > 0) {
            const overlayStar = document.createElement('div');
            overlayStar.className = 'star-overlay';
            overlayStar.innerHTML = getStarSVG(starSVGPath);
            
            overlayStar.children[0].style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
            starWrapper.appendChild(overlayStar);
        }
        
        starWrapper.classList.add(isFull ? 'filled' : isPartial ? 'partial' : 'empty');
        ratingContainer.appendChild(starWrapper);
    }
    
    return ratingContainer;
}

export default function decorate(block) {
    const ul = document.createElement('ul');
    const allFlipCards = [];

    [...block.children].forEach((row) => {
        const li = document.createElement('li');
        const flipCardContainer = document.createElement('div');
        flipCardContainer.className = 'flip-card-container';
        
        const flipCard = document.createElement('div');
        flipCard.className = 'flip-card';
        allFlipCards.push(flipCard);
        
        const cardFront = document.createElement('div');
        cardFront.className = 'flip-card-front';
        
        const cardBack = document.createElement('div');
        cardBack.className = 'flip-card-back';

        while (row.firstElementChild) li.append(row.firstElementChild);
        
        const children = [...li.children];

        if (children.length >= 2) {
            const frontColumnDiv = children[0];
            const backColumnDiv = children[1];
            const frontNodesForBack = [];
            const frontNodes = [...frontColumnDiv.children];
            
            frontNodes.forEach((node) => {
                const ratingText = node.textContent.trim().toLowerCase();
                const isRating = ratingText.includes('out of 5');

                if (isRating) {
                    const stars = createStarRating(ratingText);
                    if (stars) {
                        cardFront.append(stars);
                        frontNodesForBack.push(stars.cloneNode(true));
                        node.remove();
                        return;
                    }
                }
                
                cardFront.append(node);
                frontNodesForBack.push(node.cloneNode(true));
            });
            
            cardBack.append(...frontNodesForBack, ...backColumnDiv.children);
            
            frontColumnDiv.remove();
            backColumnDiv.remove();
        } else {
            children.forEach(child => cardFront.append(child));
        }

        flipCard.append(cardFront, cardBack);
        flipCardContainer.append(flipCard);
        li.append(flipCardContainer);

        flipCardContainer.addEventListener('click', () => {
            allFlipCards.forEach((card) => {
                if (card !== flipCard) card.classList.remove('is-flipped');
            });
            flipCard.classList.toggle('is-flipped');
        });
        
        ul.append(li);
    });
    
    ul.querySelectorAll('picture > img').forEach((img) => 
        img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]))
    );
    
    block.textContent = '';
    block.append(ul);
}
