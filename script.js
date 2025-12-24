// Configure marked.js
marked.setOptions({
    highlight: function(code, lang) {
        // Map common language aliases to Luma
        if (lang === 'luma' || lang === 'lx') {
            return hljs.highlight(code, { language: 'luma' }).value;
        }
        
        // Try to detect language
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value;
        }
        
        // Auto-detect, but prefer Rust-like highlighting for unknown syntax
        const result = hljs.highlightAuto(code, ['rust', 'c', 'cpp']);
        return result.value;
    },
    breaks: true,
    gfm: true
});

// State management for current view
let currentView = 'docs';
let stdLibFiles = [];
let currentStdLibFile = null;

// Auto-load docs.md on page load
window.addEventListener('DOMContentLoaded', () => {
    showDocs();
});

// Show documentation view
async function showDocs() {
    currentView = 'docs';
    
    // Update nav buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => btn.classList.remove('active'));
    
    const docsButton = Array.from(navButtons).find(btn => btn.textContent.trim() === 'Documentation');
    if (docsButton) {
        docsButton.classList.add('active');
    }
    
    try {
        const response = await fetch('manifest.json');
        const manifest = await response.json();
        generateSidebar(manifest, 'docs/');
        
        // Build the search index after setting up the sidebar
        buildSearchIndex();

        // Load from the manifest
        if (manifest.length > 0) {
            let defaultFile;
            if (typeof manifest[0] === 'string') {
                defaultFile = manifest[0];
            } else if (typeof manifest[0] === 'object' && manifest[0].files && manifest[0].files.length > 0) {
                defaultFile = manifest[0].files[0];
            }
            if (defaultFile) {
                navigateTo(defaultFile);
            }
        }
    } catch (error) {
        console.error('Failed to load manifest:', error);
        document.getElementById('content').innerHTML = `<div class="error">Failed to load documentation manifest.</div>`;
    }
}

// Show standard library view
async function showStdLib() {
    currentView = 'stdlib';
    
    // Update nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const nav = document.querySelector('#main-nav ul');
    nav.innerHTML = '';
    
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '<div class="loading">Loading standard library documentation...</div>';
    
    try {
        // Fetch the list of markdown files from GitHub API
        const response = await fetch('https://api.github.com/repos/Luma-Programming-Language/Luma-std/contents/docs');
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const files = await response.json();
        stdLibFiles = files.filter(file => 
            file.name.endsWith('.md') && 
            file.name !== 'README.md' && 
            file.name !== 'main.md'
        );
        
        if (stdLibFiles.length === 0) {
            throw new Error('No markdown files found in the docs directory');
        }
        
        // Build sidebar for stdlib
        buildStdLibSidebar();
        
        // Load the first file by default
        await loadStdLibFile(stdLibFiles[0]);
        
    } catch (error) {
        contentDiv.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <h2 style="color: #f85149;">❌ Failed to load standard library documentation</h2>
                <p style="color: var(--text-secondary); margin: 1rem 0;">
                    ${error.message}
                </p>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">
                    Please check your internet connection and try again.
                </p>
            </div>
        `;
    }
}

// Build sidebar for standard library files
function buildStdLibSidebar() {
    const nav = document.querySelector('#main-nav ul');
    nav.innerHTML = '';
    
    const tocHTML = stdLibFiles.map(file => {
        const name = file.name.replace('.md', '');
        return `<li><a href="#" onclick="loadStdLibFileByName('${file.name}'); return false;">${name}</a></li>`;
    }).join('');
    
    nav.innerHTML = `
        <div class="sidebar-section-header">Standard Library</div>
        <ul>${tocHTML}</ul>
    `;
}

// Load a standard library file by name
async function loadStdLibFileByName(fileName) {
    const file = stdLibFiles.find(f => f.name === fileName);
    if (file) {
        await loadStdLibFile(file);
    }
}

// Load a specific standard library file
async function loadStdLibFile(file) {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '<div class="loading">Loading...</div>';
    
    try {
        // Fetch the raw markdown content
        const response = await fetch(file.download_url);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch ${file.name}: ${response.status}`);
        }
        
        const markdown = await response.text();
        currentStdLibFile = file;
        
        // Parse and render the markdown
        parseAndRenderMarkdown(markdown);
        
        // Update active state in sidebar
        document.querySelectorAll('#main-nav a').forEach(link => {
            link.classList.remove('active');
            if (link.textContent === file.name.replace('.md', '')) {
                link.classList.add('active');
            }
        });
        
    } catch (error) {
        contentDiv.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <h2 style="color: #f85149;">❌ Failed to load file</h2>
                <p style="color: var(--text-secondary); margin: 1rem 0;">
                    ${error.message}
                </p>
            </div>
        `;
    }
}

async function tryLoadMarkdown(paths, index) {
    if (index >= paths.length) {
        document.getElementById('content').innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <h2 style="color: #f85149;">❌ Documentation file not found</h2>
                <p style="color: var(--text-secondary); margin: 1rem 0;">
                    Tried looking for markdown file in multiple locations.
                </p>
                <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 1rem;">
                    Current URL: <code>${window.location.href}</code>
                </p>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">
                    Make sure <code>docs.md</code> is in the same directory as <code>index.html</code>
                </p>
            </div>
        `;
        return;
    }
    
    try {
        const response = await fetch(paths[index]);
        if (response.ok) {
            const markdown = await response.text();
            parseAndRenderMarkdown(markdown);
            console.log(`Successfully loaded: ${paths[index]}`);
            return;
        }
    } catch (error) {
        console.log(`Failed to load: ${paths[index]}`);
    }
    
    // Try next path
    tryLoadMarkdown(paths, index + 1);
}

async function loadFromUrl(url) {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '<div class="loading">Loading markdown from URL...</div>';
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const markdown = await response.text();
        parseAndRenderMarkdown(markdown);
        
    } catch (error) {
        contentDiv.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <h2 style="color: #f85149;">❌ Failed to load documentation</h2>
                <p style="color: var(--text-secondary); margin: 1rem 0;">
                    Could not find <code>docs.md</code> file.
                </p>
                <p style="color: var(--text-secondary); font-size: 0.9rem;">
                    Make sure <code>docs.md</code> is in the same directory as <code>index.html</code>
                </p>
            </div>
        `;
    }
}

// Theme toggle
function toggleTheme() {
    const body = document.body;
    const btn = document.querySelector('.theme-toggle');
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    btn.textContent = newTheme === 'dark' ? '🌙 Dark' : '☀️ Light';
    localStorage.setItem('theme', newTheme);
}

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'dark';
document.body.setAttribute('data-theme', savedTheme);
document.querySelector('.theme-toggle').textContent = savedTheme === 'dark' ? '🌙 Dark' : '☀️ Light';

// Sidebar toggle for mobile
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

// Scroll to top button
window.addEventListener('scroll', () => {
    const scrollTop = document.getElementById('scrollTop');
    if (window.pageYOffset > 300) {
        scrollTop.classList.add('visible');
    } else {
        scrollTop.classList.remove('visible');
    }
});

function parseAndRenderMarkdown(markdown) {
    // Parse markdown to HTML
    const html = marked.parse(markdown);
    
    // Render content
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = html;
    
    // Highlight code blocks
    contentDiv.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
        
        // Add copy button
        const pre = block.parentElement;
        const wrapper = document.createElement('div');
        wrapper.className = 'code-wrapper';
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.textContent = 'Copy';
        copyBtn.onclick = function() {
            navigator.clipboard.writeText(block.textContent);
            copyBtn.textContent = 'Copied!';
            copyBtn.classList.add('copied');
            setTimeout(() => {
                copyBtn.textContent = 'Copy';
                copyBtn.classList.remove('copied');
            }, 2000);
        };
        wrapper.appendChild(copyBtn);
    });
    
    // Setup intersection observer for active section highlighting
    // setupScrollSpy();
}

function generateSidebar(manifest, docsDirectory) {
    const nav = document.querySelector('#main-nav ul');
    nav.innerHTML = ''; 

    const basePath = window.location.pathname.substring(
        0,
        window.location.pathname.lastIndexOf("/") + 1
    );

    const createLink = (file) => {
        const filePath = basePath + docsDirectory + file;
        const fileName = file.split('/').pop().replace(/\.md$/, '').replace(/_/g, ' ');
        
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${file}`; 
        a.textContent = fileName;
        a.onclick = (e) => {
            e.preventDefault();
            navigateTo(file);

            if (window.innerWidth <= 768) {
                document.getElementById("sidebar").classList.remove("active");
            }
        };
        li.appendChild(a);
        return li;
    };

    // Render items from the manifest
    manifest.forEach(item => {
        if (typeof item === 'string') {
            nav.appendChild(createLink(item));
        } 
        else if (typeof item === 'object' && item.folder && item.files) {
            const folderLi = document.createElement('li');
            folderLi.className = 'nav-item'; 

            const details = document.createElement('button');
            const title = document.createElement('span');
            title.className = 'folder-title';
            const icon = document.createElement('span');
            icon.className = 'bi bi-caret-right-fill folder-caret';
            details.className = 'folder-details';
            title.textContent = item.folder.replace(/_/g, ' ').replace(/-/g, ' ');
            details.appendChild(title);
            details.appendChild(icon);
            
            const subList = document.createElement('ul');
            subList.style.display = 'none'; 
            subList.className = 'sub-menu';
            item.files.forEach(file => subList.appendChild(createLink(file)));

            details.onclick = () => {
                const isExpanded = subList.style.display === 'block';
                subList.style.display = isExpanded ? 'none' : 'block';
                folderLi.classList.toggle('open', !isExpanded);
            };
            
            folderLi.appendChild(details);
            folderLi.appendChild(subList);
            nav.appendChild(folderLi);
        }
    });
}

async function navigateTo(file) {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '<div class="loading">Loading...</div>';

    try {
        const response = await fetch(`docs/${file}`);
        if (!response.ok) {
            throw new Error(`Failed to load ${file}`);
        }
        const markdown = await response.text();
        parseAndRenderMarkdown(markdown);

        // Update active state in sidebar
        document.querySelectorAll('#main-nav a').forEach(link => {
            link.classList.remove('active');
        });

        const activeLink = document.querySelector(`#main-nav a[href="#${file}"]`);
        if (activeLink) {
            activeLink.classList.add('active');

            // Expand parent folder if it exists
            const parentSubMenu = activeLink.closest('.sub-menu');
            if (parentSubMenu) {
                const parentNavItem = parentSubMenu.closest('.nav-item');
                if (parentNavItem) {
                    parentSubMenu.style.display = 'block';
                    parentNavItem.classList.add('open');
                }
            }
        }

    } catch (error) {
        contentDiv.innerHTML = `<div class="error">${error.message}</div>`;
    }
}

function setupScrollSpy() {
    const sections = document.querySelectorAll('.content h1, .content h2, .content h3');
    const navLinks = document.querySelectorAll('.sidebar a');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => link.classList.remove('active'));
                const activeLink = document.querySelector(`.sidebar a[href="#${entry.target.id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }, {
        rootMargin: '-20% 0px -80% 0px'
    });
    
    sections.forEach(section => observer.observe(section));
}

// Smooth scrolling for anchor links
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const id = e.target.getAttribute('href').slice(1);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Close mobile menu
            if (window.innerWidth <= 768) {
                document.getElementById('sidebar').classList.remove('active');
            }
        }
    }
});

// ===========================
// SEARCH FUNCTIONALITY
// ===========================

let searchIndex = [];
let isSearchIndexBuilt = false;

// Build search index from all documents in the manifest
async function buildSearchIndex() {
    if (isSearchIndexBuilt) return;

    console.log('Building search index...');
    searchIndex = [];

    try {
        const manifestResponse = await fetch('manifest.json');
        const manifest = await manifestResponse.json();

        const filesToIndex = [];
        manifest.forEach(item => {
            if (typeof item === 'string') {
                filesToIndex.push(item);
            } else if (item.files) {
                filesToIndex.push(...item.files);
            }
        });

        for (const file of filesToIndex) {
            try {
                const response = await fetch(`docs/${file}`);
                if (!response.ok) continue;

                const markdown = await response.text();
                const html = marked.parse(markdown);

                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;

                // Index headings
                tempDiv.querySelectorAll('h1, h2, h3, h4').forEach((heading, idx) => {
                    const slug = heading.textContent.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
                    const id = slug || `heading-${idx}`;
                    
                    searchIndex.push({
                        title: heading.textContent,
                        id: id,
                        file: file,
                        type: 'heading',
                        level: heading.tagName.toLowerCase(),
                        content: heading.nextElementSibling ? heading.nextElementSibling.textContent.slice(0, 300) : ''
                    });
                });

                // Index paragraphs
                tempDiv.querySelectorAll('p').forEach(p => {
                    const text = p.textContent;
                    if (text.length > 100 || hasKeywords(text)) {
                        const prevHeading = findPreviousHeading(p);
                        searchIndex.push({
                            title: prevHeading ? prevHeading.textContent : file.replace('.md', ''),
                            id: prevHeading ? (prevHeading.textContent.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim() || `heading-` + Math.random()) : '',
                            file: file,
                            type: 'content',
                            content: text.slice(0, 300)
                        });
                    }
                });

            } catch (error) {
                console.warn(`Could not index file ${file}:`, error);
            }
        }
        isSearchIndexBuilt = true;
        console.log('Search index built.', searchIndex.length, 'items');

    } catch (error) {
        console.error('Failed to build search index:', error);
    }
}

function findPreviousHeading(element) {
    let current = element.previousElementSibling;
    while (current) {
        if (current.matches('h1, h2, h3, h4')) {
            return current;
        }
        current = current.previousElementSibling;
    }
    return null;
}

function hasKeywords(text) {
    const keywords = ['const', 'let', 'fn', 'struct', 'enum', 'loop', 'if', 'return', 
                     'alloc', 'free', 'defer', 'cast', 'sizeof', 'pub', 'priv'];
    const lowerText = text.toLowerCase();
    return keywords.some(kw => lowerText.includes(kw));
}

// Perform search
function performSearch(query) {
    if (!query || query.length < 2) {
        return [];
    }
    
    const lowerQuery = query.toLowerCase();
    const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 1);
    
    const results = searchIndex.map(item => {
        let score = 0;
        const lowerTitle = item.title.toLowerCase();
        const lowerContent = item.content.toLowerCase();
        
        // Exact title match - highest score
        if (lowerTitle === lowerQuery) {
            score += 100;
        }
        
        // Title starts with query
        if (lowerTitle.startsWith(lowerQuery)) {
            score += 50;
        }
        
        // Title contains query
        if (lowerTitle.includes(lowerQuery)) {
            score += 30;
        }
        
        // Content contains exact query
        if (lowerContent.includes(lowerQuery)) {
            score += 20;
        }
        
        // Each word match
        queryWords.forEach(word => {
            if (lowerTitle.includes(word)) score += 10;
            if (lowerContent.includes(word)) score += 5;
        });
        
        // Bonus for heading type
        if (item.type === 'heading') {
            score += 10;
            if (item.level === 'h1') score += 5;
            if (item.level === 'h2') score += 3;
        }
        
        return { ...item, score };
    }).filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    
    return results;
}

// Highlight search terms in text
function highlightSearchTerms(text, query) {
    const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);
    let highlighted = text;
    
    words.forEach(word => {
        const regex = new RegExp(`(${word})`, 'gi');
        highlighted = highlighted.replace(regex, '<mark>$1</mark>');
    });
    
    return highlighted;
}

// Display search results
function displaySearchResults(results, query, resultsContainer) {
    if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="search-no-results">No results found</div>';
        return;
    }
    
    // Clear previous results
    resultsContainer.innerHTML = '';
    
    results.forEach(result => {
        const typeIcon = result.type === 'heading' ? '📄' : 
                        result.type === 'code' ? '💻' : '📝';
        const snippet = highlightSearchTerms(result.content.trim(), query);
        
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.innerHTML = `
            <div class="search-result-title">
                <span>${typeIcon}</span>
                <span>${highlightSearchTerms(result.title, query)}</span>
                <span class="search-result-badge">${result.type}</span>
            </div>
            <div class="search-result-snippet">${snippet}</div>
        `;
        
        // Add click event listener - use event delegation to prevent issues
        resultItem.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            navigateToResult(result.file, result.id);
        });
        
        resultsContainer.appendChild(resultItem);
    });
}

async function navigateToResult(file, id) {
    console.log('Navigating to file:', file, 'ID:', id);

    // First, navigate to the correct document
    await navigateTo(file);

    const resultsDiv = document.getElementById('searchResults');
    const mobileResultsDiv = document.getElementById('mobileSearchResults');
    const mobileOverlay = document.getElementById('mobileSearchOverlay');
    
    // Hide search results
    resultsDiv.classList.remove('active');
    mobileResultsDiv.innerHTML = '';
    mobileOverlay.classList.remove('active');
    
    // Clear search inputs
    document.getElementById('searchInput').value = '';
    document.getElementById('mobileSearchInput').value = '';
    
    // Close mobile sidebar if open
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('active');
    }
    
    // Navigate to the element
    if (id) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
            const element = document.getElementById(id);
            console.log('Found element:', element); // Debug log
            
            if (element) {
                // Scroll to element with offset for fixed header
                const headerOffset = 100;
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                console.log('Scrolling to position:', offsetPosition); // Debug log
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Highlight the element briefly
                element.style.transition = 'background 0.3s';
                element.style.background = 'var(--bg-tertiary)';
                setTimeout(() => {
                    element.style.background = '';
                }, 1500);
            } else {
                console.warn('Element not found with ID:', id);
                window.scrollTo({ top: 60, behavior: 'smooth' });
            }
        }, 150);
    } else {
        console.warn('No ID provided');
        window.scrollTo({ top: 60, behavior: 'smooth' });
    }
}

// Desktop search setup
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

searchInput.addEventListener('input', (e) => {
    const query = e.target.value;
    
    if (query.length < 2) {
        searchResults.classList.remove('active');
        return;
    }
    
    const results = performSearch(query);
    displaySearchResults(results, query, searchResults);
    searchResults.classList.add('active');
});

searchInput.addEventListener('focus', (e) => {
    if (e.target.value.length >= 2) {
        searchResults.classList.add('active');
    }
});

// Close search results when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
        searchResults.classList.remove('active');
    }
    if (!e.target.closest('.mobile-search-overlay')) {
        document.getElementById('mobileSearchOverlay').classList.remove('active');
    }
});

// Mobile search setup
const mobileSearchInput = document.getElementById('mobileSearchInput');
const mobileSearchResults = document.getElementById('mobileSearchResults');

mobileSearchInput.addEventListener('input', (e) => {
    const query = e.target.value;
    
    if (query.length < 2) {
        mobileSearchResults.innerHTML = '';
        return;
    }
    
    const results = performSearch(query);
    displaySearchResults(results, query, mobileSearchResults);
});

function toggleMobileSearch() {
    const overlay = document.getElementById('mobileSearchOverlay');
    const input = document.getElementById('mobileSearchInput');
    
    overlay.classList.toggle('active');
    
    if (overlay.classList.contains('active')) {
        setTimeout(() => input.focus(), 100);
    } else {
        input.value = '';
        mobileSearchResults.innerHTML = '';
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Cmd/Ctrl + K to focus search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (window.innerWidth <= 768) {
            toggleMobileSearch();
        } else {
            searchInput.focus();
        }
    }
    
    // Escape to close search
    if (e.key === 'Escape') {
        searchResults.classList.remove('active');
        document.getElementById('mobileSearchOverlay').classList.remove('active');
        searchInput.blur();
        mobileSearchInput.blur();
    }
});