document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector("nav ul");
    const dropdownLinks = document.querySelectorAll(".dropdown > a");

    if (hamburger && navMenu) {
        hamburger.addEventListener("click", () => {
            navMenu.classList.toggle("active");
            hamburger.classList.toggle("open");
        });
    }

    // Enable dropdown toggle on mobile
    dropdownLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            // Only run on mobile (screen < 768px)
            if (window.innerWidth < 768) {
                e.preventDefault(); // Prevent navigation
                const dropdownMenu = link.nextElementSibling;
                dropdownMenu.style.display =
                    dropdownMenu.style.display === "block" ? "none" : "block";
            }
        });
    });
    
    // === UNIVERSITY FILTERING LOGIC ===
    const universityListContainer = document.getElementById('universityList');
    const searchInput = document.getElementById('searchInput');
    const countryFilter = document.getElementById('countryFilter');
    const typeFilter = document.getElementById('typeFilter');
    const degreeFilter = document.getElementById('degreeFilter');

    let allUniversities = [];
    let currentSearchTerm = '';

    // Function to fetch university data
    async function fetchUniversities() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allUniversities = await response.json();
            console.log('Data fetched:', allUniversities);

            // Initial render
            displayUniversities(allUniversities, { searchTerm: '', selectedDegree: 'all', searchType: 'all' });
        } catch (error) {
            console.error('Could not fetch universities:', error);
            if (universityListContainer) {
                universityListContainer.innerHTML = '<p class="error-message">Failed to load universities. Please try again later.</p>';
            }
        }
    }

    // Function to display universities
    function displayUniversities(universitiesToShow, searchCriteria = {}) {
        if (!universityListContainer) return;

        universityListContainer.innerHTML = '';
        const searchTerm = searchCriteria.searchTerm.toLowerCase().trim();
        const selectedDegree = searchCriteria.selectedDegree.toLowerCase();

        if (universitiesToShow.length === 0) {
            universityListContainer.innerHTML = '<p class="no-results-message">No universities found matching your criteria.</p>';
            return;
        }

        universitiesToShow.forEach(uni => {
            const card = document.createElement('div');
            card.classList.add('university-card');
            
            let cardHtml = '';
            const matchingPrograms = searchTerm ? uni.programs.filter(prog => {
                const matchesSearch = prog.name && prog.name.toLowerCase().includes(searchTerm);
                const matchesDegree = selectedDegree === 'all' || (prog.degree && prog.degree.toLowerCase() === selectedDegree);
                return matchesSearch && matchesDegree;
            }) : [];

            if (matchingPrograms.length > 0) {
                const programsListHtml = matchingPrograms.map(prog => 
                    `<li class="program-item">${prog.name} (${prog.degree}) (${prog.language || 'N/A'}) (${prog.tuition || 'N/A'})</li>`
                ).join('');

                cardHtml = `
                    <a href="${uni.explore_url}" class="university-card-link">
                        <div class="uni-logo-wrapper">
                            <img src="${uni.explore_logo}" alt="${uni.name} Logo">
                        </div>
                        <h3>${uni.name}</h3>
                        <p class="uni-info"><strong>Country:</strong> ${uni.country}</p>
                        <p class="uni-info"><strong>Type:</strong> ${uni.type.charAt(0).toUpperCase() + uni.type.slice(1)}</p>
                        <div class="program-results">
                            <h4>Matching Programs:</h4>
                            <ul>${programsListHtml}</ul>
                        </div>
                    </a>
                `;
            } else {
                const offeredDegrees = new Set();
                if (uni.programs) {
                    uni.programs.forEach(prog => {
                        if (prog.degree) offeredDegrees.add(prog.degree.toLowerCase());
                    });
                }
                const sortedDegrees = Array.from(offeredDegrees).sort();
                const degreesText = sortedDegrees.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ');

                cardHtml = `
                    <a href="${uni.explore_url}" class="university-card-link">
                        <div class="uni-logo-wrapper">
                            <img src="${uni.explore_logo}" alt="${uni.name} Logo">
                        </div>
                        <h3>${uni.name}</h3>
                        <p class="uni-info"><strong>Country:</strong> ${uni.country}</p>
                        <p class="uni-info"><strong>Type:</strong> ${uni.type.charAt(0).toUpperCase() + uni.type.slice(1)}</p>
                        <p class="uni-info"><strong>Degrees:</strong> ${degreesText || 'N/A'}</p>
                        <p class="uni-description">${uni.description || 'No description available.'}</p>
                    </a>
                `;
            }

            card.innerHTML = cardHtml;
            universityListContainer.appendChild(card);
        });
    }

    // Filter function
    function filterAndRenderUniversities() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedCountry = countryFilter.value.toLowerCase();
        const selectedType = typeFilter.value.toLowerCase();
        const selectedDegree = degreeFilter.value.toLowerCase();

        currentSearchTerm = searchTerm;
        
        const filteredUniversities = allUniversities.filter(uni => {
            const programs = uni.programs || [];
            const matchesCountry = selectedCountry === '' || (uni.country && uni.country.toLowerCase() === selectedCountry);
            const matchesType = selectedType === '' || (uni.type && uni.type.toLowerCase() === selectedType);

            if (!matchesCountry || !matchesType) return false;

            const uniInfoMatchesSearch = searchTerm === '' ||
                uni.name.toLowerCase().includes(searchTerm) ||
                (uni.description && uni.description.toLowerCase().includes(searchTerm));

            const hasProgramMatchingBoth = programs.some(prog => {
                const programNameMatchesSearch = prog.name && prog.name.toLowerCase().includes(searchTerm);
                const programMatchesDegree = selectedDegree === '' || (prog.degree && prog.degree.toLowerCase() === selectedDegree);
                return programNameMatchesSearch && programMatchesDegree;
            });

            if (hasProgramMatchingBoth) return true;

            if (uniInfoMatchesSearch) {
                if (selectedDegree === '') return true;
                return programs.some(prog => prog.degree && prog.degree.toLowerCase() === selectedDegree);
            }

            return false;
        });

        displayUniversities(filteredUniversities, { searchTerm, selectedDegree });
    }

    if (searchInput) searchInput.addEventListener('input', filterAndRenderUniversities);
    if (countryFilter) countryFilter.addEventListener('change', filterAndRenderUniversities);
    if (typeFilter) typeFilter.addEventListener('change', filterAndRenderUniversities);
    if (degreeFilter) degreeFilter.addEventListener('change', filterAndRenderUniversities);

    if (universityListContainer) fetchUniversities();
});
