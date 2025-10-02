document.addEventListener('DOMContentLoaded', () => {
    // === IMPROVED HEADER NAVIGATION ===
    const hamburger = document.querySelector(".hamburger");
    const navMenu = document.querySelector("nav ul");
    const dropdownParents = document.querySelectorAll(".dropdown > a");
    const subDropdownParents = document.querySelectorAll(".sub-dropdown > a");

    // Hamburger menu toggle
    if (hamburger && navMenu) {
        hamburger.addEventListener("click", (e) => {
            e.stopPropagation();
            navMenu.classList.toggle("active");
            hamburger.classList.toggle("open");
        });

        // Close menu when clicking outside
        document.addEventListener("click", (e) => {
            if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
                navMenu.classList.remove("active");
                hamburger.classList.remove("open");
            }
        });
    }

    // Mobile dropdown behavior
    if (window.innerWidth < 768) {
        // Main dropdowns (Countries menu)
        dropdownParents.forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                const parent = link.parentElement;
                const dropdownMenu = link.nextElementSibling;

                // Close other open dropdowns
                document.querySelectorAll('.dropdown').forEach(dropdown => {
                    if (dropdown !== parent) {
                        const menu = dropdown.querySelector('.dropdown-menu');
                        if (menu) menu.style.display = 'none';
                    }
                });

                // Toggle current dropdown
                if (dropdownMenu) {
                    dropdownMenu.style.display =
                        dropdownMenu.style.display === "block" ? "none" : "block";
                }
            });
        });

        // Sub-dropdowns (Public/Private universities)
        subDropdownParents.forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                const parent = link.parentElement;
                const subMenu = link.nextElementSibling;

                // Close other sub-menus
                document.querySelectorAll('.sub-dropdown').forEach(subDropdown => {
                    if (subDropdown !== parent) {
                        const menu = subDropdown.querySelector('.sub-menu');
                        if (menu) menu.style.display = 'none';
                    }
                });

                // Toggle current sub-menu
                if (subMenu) {
                    subMenu.style.display =
                        subMenu.style.display === "block" ? "none" : "block";
                }
            });
        });
    }

    // === IMPROVED UNIVERSITY SEARCH & FILTER ===
    const universityListContainer = document.getElementById('universityList');
    const searchInput = document.getElementById('searchInput');
    const countryFilter = document.getElementById('countryFilter');
    const typeFilter = document.getElementById('typeFilter');
    const degreeFilter = document.getElementById('degreeFilter');
    const languageFilter = document.getElementById('languageFilter');

    let allUniversities = [];
    let filteredCount = 0;

    // Debounce function for better performance
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Fetch universities with better error handling
    async function fetchUniversities() {
        if (!universityListContainer) return;

        try {
            universityListContainer.innerHTML = '<p class="loading-message">Loading universities...</p>';

            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            allUniversities = await response.json();
            console.log(`✅ Loaded ${allUniversities.length} universities`);

            populateLanguageFilter(allUniversities);
            populateDegreeFilter(allUniversities);
            displayUniversities(allUniversities, {});

        } catch (error) {
            console.error('❌ Error loading universities:', error);
            universityListContainer.innerHTML = `
                <div class="error-message">
                    <p>⚠️ Failed to load universities.</p>
                    <p>Please refresh the page or try again later.</p>
                </div>
            `;
        }
    }

    // Populate language filter
    function populateLanguageFilter(universities) {
        if (!languageFilter) return;

        const languageSet = new Set();
        universities.forEach(uni => {
            (uni.programs || []).forEach(prog => {
                if (prog.language) {
                    // Extract language words (handles "30% English" or "English/Turkish")
                    const words = prog.language.split(/[^a-zA-Z]+/);
                    words.forEach(word => {
                        if (word.length > 1) {
                            const formatted = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                            languageSet.add(formatted);
                        }
                    });
                }
            });
        });

        const languages = Array.from(languageSet).sort();
        languageFilter.innerHTML = `
            <option value="">All Languages</option>
            ${languages.map(lang => `<option value="${lang}">${lang}</option>`).join('')}
        `;
    }

    // Populate degree filter
    function populateDegreeFilter(universities) {
        if (!degreeFilter) return;

        const degreeSet = new Set();
        universities.forEach(uni => {
            (uni.programs || []).forEach(prog => {
                if (prog.degree) degreeSet.add(prog.degree);
            });
        });

        const degrees = Array.from(degreeSet).sort();
        degreeFilter.innerHTML = `
            <option value="">All Degrees</option>
            ${degrees.map(deg => `<option value="${deg.toLowerCase()}">${deg}</option>`).join('')}
        `;
    }

    // Display universities with results count
    function displayUniversities(universitiesToShow, searchCriteria = {}) {
        if (!universityListContainer) return;

        const searchTerm = (searchCriteria.searchTerm || '').toLowerCase().trim();
        const selectedDegree = (searchCriteria.selectedDegree || '').toLowerCase();
        const selectedLanguage = (searchCriteria.selectedLanguage || '').toLowerCase();

        filteredCount = universitiesToShow.length;

        if (universitiesToShow.length === 0) {
            universityListContainer.innerHTML = `
                <div class="no-results-message">
                    <p>🔍 No universities found matching your criteria.</p>
                    <p>Try adjusting your filters or search terms.</p>
                </div>
            `;
            return;
        }

        // Add results counter
        const resultsInfo = document.createElement('div');
        resultsInfo.className = 'results-info';
        resultsInfo.innerHTML = `<p>Showing <strong>${filteredCount}</strong> ${filteredCount === 1 ? 'university' : 'universities'}</p>`;
        universityListContainer.innerHTML = '';
        universityListContainer.appendChild(resultsInfo);

        universitiesToShow.forEach(uni => {
            const card = document.createElement('div');
            card.classList.add('university-card');

            const matchingPrograms = searchTerm ? (uni.programs || []).filter(prog => {
                const matchesSearch = prog.name && prog.name.toLowerCase().includes(searchTerm);
                const matchesDegree = !selectedDegree || (prog.degree && prog.degree.toLowerCase() === selectedDegree);
                const matchesLanguage = !selectedLanguage || (prog.language && prog.language.toLowerCase().includes(selectedLanguage));
                return matchesSearch && matchesDegree && matchesLanguage;
            }) : [];

            let cardHtml = '';

            if (matchingPrograms.length > 0) {
                const programsListHtml = matchingPrograms.slice(0, 5).map(prog =>
                    `<li class="program-item">
                        <strong>${prog.name}</strong>
                        <span class="program-meta">${prog.degree} | ${prog.language || 'N/A'} | ${prog.tuition || 'N/A'}</span>
                    </li>`
                ).join('');

                const morePrograms = matchingPrograms.length > 5 ?
                    `<p class="more-programs">+ ${matchingPrograms.length - 5} more programs</p>` : '';

                cardHtml = `
                    <a href="${uni.explore_url}" class="university-card-link">
                        <div class="uni-logo-wrapper">
                            <img src="${uni.explore_logo}" alt="${uni.name} Logo" loading="lazy">
                        </div>
                        <h3>${uni.name}</h3>
                        <p class="uni-info"><strong>📍</strong> ${uni.country}</p>
                        <p class="uni-info"><strong>🏛️</strong> ${uni.type.charAt(0).toUpperCase() + uni.type.slice(1)}</p>
                        <div class="program-results">
                            <h4>Matching Programs (${matchingPrograms.length}):</h4>
                            <ul>${programsListHtml}</ul>
                            ${morePrograms}
                        </div>
                    </a>
                `;
            } else {
                const offeredDegrees = new Set();
                (uni.programs || []).forEach(prog => {
                    if (prog.degree) offeredDegrees.add(prog.degree.toLowerCase());
                });
                const degreesText = Array.from(offeredDegrees)
                    .sort()
                    .map(d => d.charAt(0).toUpperCase() + d.slice(1))
                    .join(', ');

                cardHtml = `
                    <a href="${uni.explore_url}" class="university-card-link">
                        <div class="uni-logo-wrapper">
                            <img src="${uni.explore_logo}" alt="${uni.name} Logo" loading="lazy">
                        </div>
                        <h3>${uni.name}</h3>
                        <p class="uni-info"><strong>📍</strong> ${uni.country}</p>
                        <p class="uni-info"><strong>🏛️</strong> ${uni.type.charAt(0).toUpperCase() + uni.type.slice(1)}</p>
                        <p class="uni-info"><strong>🎓</strong> ${degreesText || 'Various programs'}</p>
                        <p class="uni-description">${uni.description || 'Click to explore available programs.'}</p>
                    </a>
                `;
            }

            card.innerHTML = cardHtml;
            universityListContainer.appendChild(card);
        });
    }

    // Main filter function
    function filterAndRenderUniversities() {
        const searchTerm = searchInput?.value.toLowerCase().trim() || '';
        const selectedCountry = countryFilter?.value.toLowerCase() || '';
        const selectedType = typeFilter?.value.toLowerCase() || '';
        const selectedDegree = degreeFilter?.value.toLowerCase() || '';
        const selectedLanguage = languageFilter?.value.toLowerCase() || '';

        const filteredUniversities = allUniversities.filter(uni => {
            const programs = uni.programs || [];

            // Country and type filters
            const matchesCountry = !selectedCountry || (uni.country && uni.country.toLowerCase() === selectedCountry);
            const matchesType = !selectedType || (uni.type && uni.type.toLowerCase() === selectedType);

            if (!matchesCountry || !matchesType) return false;

            // Search term in university info
            const uniInfoMatches = !searchTerm ||
                uni.name.toLowerCase().includes(searchTerm) ||
                (uni.description && uni.description.toLowerCase().includes(searchTerm));

            // Program-specific matches
            const hasProgramMatch = programs.some(prog => {
                const nameMatch = !searchTerm || (prog.name && prog.name.toLowerCase().includes(searchTerm));
                const degreeMatch = !selectedDegree || (prog.degree && prog.degree.toLowerCase() === selectedDegree);
                const languageMatch = !selectedLanguage || (prog.language && prog.language.toLowerCase().includes(selectedLanguage));
                return nameMatch && degreeMatch && languageMatch;
            });

            if (hasProgramMatch) return true;

            // If searching by uni info, still check degree/language availability
            if (uniInfoMatches) {
                const hasDegree = !selectedDegree || programs.some(prog =>
                    prog.degree && prog.degree.toLowerCase() === selectedDegree
                );
                const hasLanguage = !selectedLanguage || programs.some(prog =>
                    prog.language && prog.language.toLowerCase().includes(selectedLanguage)
                );
                return hasDegree && hasLanguage;
            }

            return false;
        });

        displayUniversities(filteredUniversities, {
            searchTerm,
            selectedDegree,
            selectedLanguage
        });
    }

    // Debounced search for better performance
    const debouncedFilter = debounce(filterAndRenderUniversities, 300);

    // Event listeners
    if (searchInput) searchInput.addEventListener('input', debouncedFilter);
    if (countryFilter) countryFilter.addEventListener('change', filterAndRenderUniversities);
    if (typeFilter) typeFilter.addEventListener('change', filterAndRenderUniversities);
    if (degreeFilter) degreeFilter.addEventListener('change', filterAndRenderUniversities);
    if (languageFilter) languageFilter.addEventListener('change', filterAndRenderUniversities);

    // Initialize
    if (universityListContainer) fetchUniversities();
});