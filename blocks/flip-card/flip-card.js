import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Generates an SVG star rating element based on a text rating (e.g., "4 out of 5").
 * @param {string} ratingText The text containing the rating (e.g., "4 out of 5").
 * @param {number} maxRating The total number of stars (default is 5).
 * @returns {HTMLDivElement|null} A div element containing the SVG stars, or null if parsing fails.
 */
function createStarRating(ratingText, maxRating = 5) {
    // Regex to extract the first number, which is assumed to be the score.
    const match = ratingText.match(/(\d+(\.\d+)?)/);
    if (!match) return null;

    const score = parseFloat(match[1]);
    if (isNaN(score)) return null;

    const ratingContainer = document.createElement('div');
    ratingContainer.className = 'star-rating';
    ratingContainer.setAttribute('aria-label', `${score} out of ${maxRating} stars`);
    
    // The SVG code for a single star
    const starSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="star">
            <path d="M12 17.27l6.18 3.73-1.64-7.03 5.46-4.73-7.19-.61L12 2.6l-2.77 6.13-7.19.61 5.46 4.73-1.64 7.03z"/>
        </svg>
    `;
    
    for (let i = 1; i <= maxRating; i++) {
        const star = document.createElement('span');
        star.innerHTML = starSVG;
        
        let percentage = 0;
        if (i <= Math.floor(score)) {
            // Full star
            percentage = 100;
        } else if (i === Math.ceil(score) && score % 1 !== 0) {
            // Partial star (e.g., 3.5 score means 4th star is 50%)
            percentage = (score - Math.floor(score)) * 100;
        }

        if (percentage > 0) {
            // Apply clipping for partial and full stars
            star.children[0].style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
        }
        
        // Add a class for styling: fully-filled stars can be styled differently if needed
        if (i <= score) {
            star.classList.add('filled');
        } else if (percentage > 0) {
            star.classList.add('partial');
        } else {
            star.classList.add('empty');
        }

        ratingContainer.appendChild(star);
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
                // Check if the node is a paragraph containing a rating text
                const ratingText = node.textContent.trim().toLowerCase();
                const isRating = ratingText.includes('out of 5');

                if (isRating) {
                    const stars = createStarRating(ratingText);
                    if (stars) {
                        // 1. Move the generated stars to cardFront
                        cardFront.append(stars);
                        // 2. Clone the stars for the back card's content
                        frontNodesForBack.push(stars.cloneNode(true));
                        return; // Skip the default append/clone for the original text node
                    }
                }
                
                // Default: Move the actual node to the front card
                cardFront.append(node);
                
                // Default: Clone the node for the back card's content
                frontNodesForBack.push(node.cloneNode(true));
            });
            
            // Append the Cloned Front Content to the Card Back first
            cardBack.append(...frontNodesForBack);

            // Append the Original Back Content (Description, Link)
            cardBack.append(...backColumnDiv.children);
            
        } else {
            children.forEach(child => cardFront.append(child));
        }

        flipCard.append(cardFront, cardBack);
        flipCardContainer.append(flipCard);
        li.append(flipCardContainer);

        flipCardContainer.addEventListener('click', () => {
            allFlipCards.forEach((card) => {
                if (card !== flipCard) {
                    card.classList.remove('is-flipped');
                }
            });
            flipCard.classList.toggle('is-flipped');
        });
        
        ul.append(li);
    });
    
    ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
    
    block.textContent = '';
    block.append(ul);
}


/*

import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
    const ul = document.createElement('ul');

    [...block.children].forEach((row) => {
        const li = document.createElement('li');
        
        const flipCardContainer = document.createElement('div');
        flipCardContainer.className = 'flip-card-container';
        
        const flipCard = document.createElement('div');
        flipCard.className = 'flip-card';
        
        const cardFront = document.createElement('div');
        cardFront.className = 'flip-card-front';
        
        const cardBack = document.createElement('div');
        cardBack.className = 'flip-card-back';

        while (row.firstElementChild) li.append(row.firstElementChild);
        
        const children = [...li.children];

        if (children.length >= 2) {
            cardFront.append(children[0]);
            cardBack.append(children[1]);
        } else {
            children.forEach(child => cardFront.append(child));
        }

        flipCard.append(cardFront, cardBack);
        flipCardContainer.append(flipCard);
        li.append(flipCardContainer);

        flipCardContainer.addEventListener('click', () => {
            flipCard.classList.toggle('is-flipped');
        });
        
        ul.append(li);
    });
    
    ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
    
    block.textContent = '';
    block.append(ul);
}
-------------------------------------------Another varient --------------------------------------
import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
    const ul = document.createElement('ul');

    [...block.children].forEach((row) => {
        const li = document.createElement('li');
        
        const flipCardContainer = document.createElement('div');
        flipCardContainer.className = 'flip-card-container';
        
        const flipCard = document.createElement('div');
        flipCard.className = 'flip-card';
        
        const cardFront = document.createElement('div');
        cardFront.className = 'flip-card-front';
        
        const cardBack = document.createElement('div');
        cardBack.className = 'flip-card-back';

        // Move all content from the row into the list item (li)
        while (row.firstElementChild) li.append(row.firstElementChild);
        
        const children = [...li.children];

        // Ensure there are at least two columns
        if (children.length >= 2) {
            const frontColumnDiv = children[0]; // Left column (Image, Title, Rating)
            const backColumnDiv = children[1];  // Right column (Description, Link)

            // --- Corrected Logic Starts Here ---
            
            // 1. **Store the nodes** from the front column *before* moving them.
            // We need an array of cloned nodes for the back card.
            const frontNodesForBack = [];
            
            // Get the live collection of nodes to be moved/cloned
            const frontNodes = [...frontColumnDiv.children];
            
            // 2. Populate the Card Front and simultaneously clone nodes for the back.
            frontNodes.forEach((node) => {
                // Move the actual node to the front card
                cardFront.append(node);
                
                // Clone the node (deep clone) for the back card's content
                frontNodesForBack.push(node.cloneNode(true));
            });
            
            // 3. Append the Cloned Front Content (Image, Title, Rating) to the Card Back first.
            cardBack.append(...frontNodesForBack);

            // 4. Append the Original Back Content (Description, Learn More Link).
            // This is done by moving the children from the second column div.
            cardBack.append(...backColumnDiv.children);
            
            // --- Corrected Logic Ends Here ---

        } else {
            // Fallback for single-column content
            children.forEach(child => cardFront.append(child));
        }

        flipCard.append(cardFront, cardBack);
        flipCardContainer.append(flipCard);
        li.append(flipCardContainer);

        flipCardContainer.addEventListener('click', () => {
            // 1. Un-flip all other cards
            allFlipCards.forEach((card) => {
                if (card !== flipCard) {
                    card.classList.remove('is-flipped');
                }
            });

            // 2. Toggle the clicked card
            flipCard.classList.toggle('is-flipped');
        });
        
        ul.append(li);
    });
    
    // Optimize all images after constructing the DOM structure
    // This is crucial because images now exist in both cardFront and cardBack.
    ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
    
    block.textContent = '';
    block.append(ul);
}
    */