document.addEventListener('DOMContentLoaded', () => {
    // === HEADER NAVIGATION LOGIC ===
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
    const languageFilter = document.getElementById('languageFilter'); // Add this line

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

            populateLanguageFilter(allUniversities); // Populate language filter options
            populateDegreeFilter(allUniversities); // Populate degree filter options

            // Initial render
            displayUniversities(allUniversities, { searchTerm: '', selectedDegree: 'all', selectedLanguage: 'all', searchType: 'all' });
        } catch (error) {
            console.error('Could not fetch universities:', error);
            if (universityListContainer) {
                universityListContainer.innerHTML = '<p class="error-message">Failed to load universities. Please try again later.</p>';
            }
        }
    }

    // Populate language filter options dynamically
    function populateLanguageFilter(universities) {
        if (!languageFilter) return;
        const languageSet = new Set();
        universities.forEach(uni => {
            (uni.programs || []).forEach(prog => {
                if (prog.language) {
                    // Extract words (e.g., "Arabic" from "30% Arabic")
                    prog.language.split(/[^A-Za-z]+/).forEach(word => {
                        if (word.length > 1) languageSet.add(word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
                    });
                }
            });
        });
        const languages = Array.from(languageSet).sort();
        languageFilter.innerHTML = `<option value="">All Languages</option>` +
            languages.map(lang => `<option value="${lang}">${lang}</option>`).join('');
    }

    // Populate degree filter options dynamically
    function populateDegreeFilter(universities) {
        if (!degreeFilter) return;
        const degreeSet = new Set();
        universities.forEach(uni => {
            (uni.programs || []).forEach(prog => {
                if (prog.degree) degreeSet.add(prog.degree);
            });
        });
        const degrees = Array.from(degreeSet).sort();
        degreeFilter.innerHTML = `<option value="">All Degrees</option>` +
            degrees.map(deg => `<option value="${deg.toLowerCase()}">${deg}</option>`).join('');
    }

    // Function to display universities
    function displayUniversities(universitiesToShow, searchCriteria = {}) {
        if (!universityListContainer) return;

        universityListContainer.innerHTML = '';
        const searchTerm = (searchCriteria.searchTerm || '').toLowerCase().trim();
        const selectedDegree = (searchCriteria.selectedDegree || '').toLowerCase();
        const selectedLanguage = (searchCriteria.selectedLanguage || '').toLowerCase();

        if (universitiesToShow.length === 0) {
            universityListContainer.innerHTML = '<p class="no-results-message">No universities found matching your criteria.</p>';
            return;
        }

        universitiesToShow.forEach(uni => {
            const card = document.createElement('div');
            card.classList.add('university-card');

            let cardHtml = '';
            const matchingPrograms = searchTerm ? (uni.programs || []).filter(prog => {
                const matchesSearch = prog.name && prog.name.toLowerCase().includes(searchTerm);
                const matchesDegree = selectedDegree === 'all' || selectedDegree === '' || (prog.degree && prog.degree.toLowerCase() === selectedDegree);
                // Use substring match for language
                const matchesLanguage = selectedLanguage === 'all' || selectedLanguage === '' ||
                    (prog.language && prog.language.toLowerCase().includes(selectedLanguage));
                return matchesSearch && matchesDegree && matchesLanguage;
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
        const selectedLanguage = languageFilter ? languageFilter.value.toLowerCase() : '';

        currentSearchTerm = searchTerm;

        const filteredUniversities = allUniversities.filter(uni => {
            const programs = uni.programs || [];
            const matchesCountry = selectedCountry === '' || (uni.country && uni.country.toLowerCase() === selectedCountry);
            const matchesType = selectedType === '' || (uni.type && uni.type.toLowerCase() === selectedType);

            if (!matchesCountry || !matchesType) return false;

            const uniInfoMatchesSearch = searchTerm === '' ||
                uni.name.toLowerCase().includes(searchTerm) ||
                (uni.description && uni.description.toLowerCase().includes(searchTerm));

            const hasProgramMatchingAll = programs.some(prog => {
                const programNameMatchesSearch = prog.name && prog.name.toLowerCase().includes(searchTerm);
                const programMatchesDegree = selectedDegree === '' || (prog.degree && prog.degree.toLowerCase() === selectedDegree);
                // Match if selected language is a substring (case-insensitive)
                const programMatchesLanguage = selectedLanguage === '' ||
                    (prog.language && prog.language.toLowerCase().includes(selectedLanguage));
                return programNameMatchesSearch && programMatchesDegree && programMatchesLanguage;
            });

            if (hasProgramMatchingAll) return true;

            if (uniInfoMatchesSearch) {
                // If searching by university info, still require degree/language if selected
                let degreeOk = selectedDegree === '' || programs.some(prog => prog.degree && prog.degree.toLowerCase() === selectedDegree);
                let languageOk = selectedLanguage === '' ||
                    programs.some(prog => prog.language && prog.language.toLowerCase().includes(selectedLanguage));
                return degreeOk && languageOk;
            }

            return false;
        });

        displayUniversities(filteredUniversities, { searchTerm, selectedDegree, selectedLanguage });
    }

    if (searchInput) searchInput.addEventListener('input', filterAndRenderUniversities);
    if (countryFilter) countryFilter.addEventListener('change', filterAndRenderUniversities);
    if (typeFilter) typeFilter.addEventListener('change', filterAndRenderUniversities);
    if (degreeFilter) degreeFilter.addEventListener('change', filterAndRenderUniversities);
    if (languageFilter) languageFilter.addEventListener('change', filterAndRenderUniversities);

    if (universityListContainer) fetchUniversities();
});