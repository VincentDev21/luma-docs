if (typeof hljs !== 'undefined') {
    hljs.registerLanguage('luma', function(hljs) {
        return {
            name: 'Luma',
            keywords: {
                keyword: 'const let if elif else loop break continue return defer switch fn struct enum pub priv cast sizeof alloc free',
                type: 'int uint float double bool byte str void',
                literal: 'true false',
                built_in: 'output outputln input system'
            },
            contains: [
                hljs.C_LINE_COMMENT_MODE,
                hljs.C_BLOCK_COMMENT_MODE,
                hljs.QUOTE_STRING_MODE,
                hljs.APOS_STRING_MODE,
                {
                    className: 'string',
                    begin: '"',
                    end: '"',
                    contains: [hljs.BACKSLASH_ESCAPE]
                },
                {
                    className: 'number',
                    begin: '\\b\\d+(\\.\\d+)?',
                    relevance: 0
                },
                {
                    className: 'meta',
                    begin: '@module|@use|#returns_ownership|#takes_ownership'
                },
                {
                    className: 'function',
                    beginKeywords: 'fn',
                    end: '{',
                    excludeEnd: true,
                    contains: [
                        {
                            className: 'title',
                            begin: hljs.IDENT_RE
                        },
                        {
                            className: 'params',
                            begin: '\\(',
                            end: '\\)',
                            keywords: {
                                keyword: 'const let',
                                type: 'int uint float double bool byte str void'
                            }
                        }
                    ]
                },
                {
                    className: 'operator',
                    begin: '->|::|[+\\-*/%=<>!&|^]'
                }
            ]
        };
    });
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
    loadFromUrl('docs.md');
});

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