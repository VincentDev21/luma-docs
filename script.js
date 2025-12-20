if (typeof hljs !== 'undefined') {
    hljs.registerLanguage('luma', function(hljs) {
        const KEYWORDS = [
            'const', 'let', 'if', 'elif', 'else', 'loop', 'break', 
            'continue', 'return', 'defer', 'switch', 'fn', 'struct', 
            'enum', 'pub', 'priv', 'as'
        ];
        
        const TYPES = [
            'int', 'uint', 'float', 'double', 'bool', 'byte', 'void'
        ];
        
        const LITERALS = ['true', 'false'];
        
        const BUILTINS = [
            'output', 'outputln', 'input', 'system', 
            'alloc', 'free', 'sizeof', 'cast'
        ];

        return {
            name: 'Luma',
            aliases: ['lx'],
            keywords: {
                keyword: KEYWORDS,
                type: TYPES,
                literal: LITERALS,
                built_in: BUILTINS
            },
            contains: [
                // Line comments
                hljs.COMMENT('//', '$', {
                    relevance: 0
                }),
                
                // Block comments
                hljs.COMMENT('/\\*', '\\*/', {
                    relevance: 0
                }),
                
                // Directives (@module, @use, #attributes)
                {
                    className: 'meta',
                    begin: /@(module|use)\b/,
                    end: /$/,
                    contains: [
                        hljs.QUOTE_STRING_MODE,
                        {
                            className: 'keyword',
                            begin: /\bas\b/
                        }
                    ],
                    relevance: 10
                },
                {
                    className: 'meta',
                    begin: /#(returns_ownership|takes_ownership)\b/,
                    relevance: 10
                },
                
                // String literals
                {
                    className: 'string',
                    begin: '"',
                    end: '"',
                    contains: [
                        {
                            begin: /\\[nrt\\'"\x]/
                        }
                    ],
                    relevance: 0
                },
                
                // Character literals
                {
                    className: 'string',
                    begin: "'",
                    end: "'",
                    contains: [
                        {
                            begin: /\\[nrt\\'"\x]/
                        }
                    ],
                    relevance: 0
                },
                
                // Numbers (integers, floats, hex)
                {
                    className: 'number',
                    variants: [
                        { begin: '\\b0[xX][0-9a-fA-F]+\\b' },
                        { begin: '\\b\\d+\\.\\d+([eE][+-]?\\d+)?\\b' },
                        { begin: '\\b\\d+\\b' }
                    ],
                    relevance: 0
                },
                
                // Type declarations (after ->)
                {
                    begin: /->(?=\s*(fn|struct|enum))/,
                    className: 'operator',
                    relevance: 0
                },
                
                // Function definitions
                {
                    className: 'function',
                    beginKeywords: 'fn',
                    end: /[{;]/,
                    excludeEnd: true,
                    illegal: /\S/,
                    contains: [
                        {
                            className: 'title',
                            begin: /[a-zA-Z_][a-zA-Z0-9_]*/,
                            relevance: 0
                        },
                        {
                            className: 'params',
                            begin: /\(/,
                            end: /\)/,
                            keywords: {
                                keyword: KEYWORDS,
                                type: TYPES
                            },
                            contains: [
                                hljs.COMMENT('//', '$'),
                                hljs.COMMENT('/\\*', '\\*/'),
                                {
                                    className: 'type',
                                    begin: /:\s*/,
                                    end: /[,)]/,
                                    excludeEnd: true,
                                    keywords: {
                                        type: TYPES
                                    }
                                }
                            ]
                        },
                        {
                            // Return type
                            begin: /\)\s*/,
                            end: /[{;]/,
                            excludeEnd: true,
                            keywords: {
                                type: TYPES
                            }
                        }
                    ]
                },
                
                // Struct/enum definitions
                {
                    className: 'class',
                    beginKeywords: 'struct enum',
                    end: /[{;]/,
                    excludeEnd: true,
                    contains: [
                        {
                            className: 'title',
                            begin: /[a-zA-Z_][a-zA-Z0-9_]*/
                        },
                        {
                            // Generic parameters
                            begin: /<[^>]+>/
                        }
                    ]
                },
                
                // Type annotations (: Type)
                {
                    begin: /:\s*/,
                    end: /[;,=)\]]/,
                    excludeEnd: true,
                    returnBegin: true,
                    keywords: {
                        type: TYPES
                    },
                    contains: [
                        {
                            className: 'type',
                            begin: /:\s*/,
                            end: /[;,=)\]]/,
                            excludeEnd: true
                        }
                    ]
                },
                
                // Static access (Module::function, Enum::Variant)
                {
                    className: 'built_in',
                    begin: /[a-zA-Z_][a-zA-Z0-9_]*::/,
                    relevance: 5
                },
                
                // Cast and sizeof with generic syntax
                {
                    className: 'built_in',
                    begin: /\b(cast|sizeof)<[^>]+>/,
                    relevance: 5
                },
                
                // Operators
                {
                    className: 'operator',
                    begin: /->|::|[+\-*\/%=<>!&|^]+/,
                    relevance: 0
                },
                
                // Pointer and reference operators
                {
                    className: 'operator',
                    begin: /[*&]/,
                    relevance: 0
                }
            ]
        };
    });
    
    // Auto-highlight on page load
    if (typeof document !== 'undefined') {
        document.addEventListener('DOMContentLoaded', function() {
            hljs.highlightAll();
        });
    }
}

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

// Auto-load docs.md on page load
window.addEventListener('DOMContentLoaded', () => {
    // Get the base path (works for both local and GitHub Pages)
    const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    
    // Try multiple possible locations
    const possiblePaths = [
        basePath + 'docs.md',
        basePath + 'DOCS.md',
        basePath + 'README.md',
        './docs.md',
        'docs.md',
        '../docs.md'
    ];
    
    tryLoadMarkdown(possiblePaths, 0);
});

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
    
    // Generate table of contents
    generateTOC();
    
    // Setup intersection observer for active section highlighting
    setupScrollSpy();
}

function generateTOC() {
    const content = document.getElementById('content');
    const headings = content.querySelectorAll('h1, h2, h3');
    const toc = document.getElementById('toc');
    
    // Add IDs to headings
    headings.forEach((heading, index) => {
        if (!heading.id) {
            heading.id = 'heading-' + index;
        }
    });
    
    // Build TOC
    const tocHTML = Array.from(headings).map(heading => {
        const level = heading.tagName.toLowerCase();
        const text = heading.textContent;
        const id = heading.id;
        
        return `<li><a href="#${id}" data-level="${level}">${text}</a></li>`;
    }).join('');
    
    toc.innerHTML = `<ul>${tocHTML}</ul>`;
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