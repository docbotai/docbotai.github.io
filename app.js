const WORKER_URL = "https://tailieu-ai.mnhmanh0910.workers.dev/";

// --- MOBILE CONTEXT MENU ---
const mobileMenuContainer = document.createElement('div');
mobileMenuContainer.id = 'mobileMessageMenu';
mobileMenuContainer.style.cssText = 'display: none; position: fixed; z-index: 10000; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); min-width: 150px; flex-direction: column; overflow: hidden; font-family: inherit; transition: opacity 0.2s; opacity: 0;';
mobileMenuContainer.innerHTML = `
    <div id="mcm-edit" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #f1f5f9; cursor: pointer;">
        <div style="background: rgba(245, 158, 11, 0.1); border-radius: 50%; padding: 6px; display: flex; color: #f59e0b;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </div>
        <span style="color: #f59e0b; font-weight: 500; font-size: 15px;">Chỉnh sửa</span>
    </div>
    <div id="mcm-copy" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; cursor: pointer;">
        <div style="background: rgba(16, 163, 127, 0.1); border-radius: 50%; padding: 6px; display: flex; color: #10a37f;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        </div>
        <span style="color: #10a37f; font-weight: 500; font-size: 15px;">Sao chép</span>
    </div>
`;
document.body.appendChild(mobileMenuContainer);

document.addEventListener('click', (e) => {
    if (!mobileMenuContainer.contains(e.target)) {
        mobileMenuContainer.style.opacity = '0';
        setTimeout(() => { if (mobileMenuContainer.style.opacity === '0') mobileMenuContainer.style.display = 'none'; }, 200);
    }
});
document.addEventListener('scroll', () => {
    mobileMenuContainer.style.opacity = '0';
    setTimeout(() => { if (mobileMenuContainer.style.opacity === '0') mobileMenuContainer.style.display = 'none'; }, 200);
}, true);


// ==========================================
// Cáº¤U HÃŒNH SUPABASE
// ==========================================
const SUPABASE_URL = 'https://rvgevlirgslbkfbpugfq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2Z2V2bGlyZ3NsYmtmYnB1Z2ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1Mzg4MDAsImV4cCI6MjEwMTExNDgwMH0.ccRsKmi1yZem6Ye0DYF3362Nn-fUn7-lXvPUwLBEmNA';

// ==========================================
// Cáº¤U HÃŒNH GEMINI API (Máº¢NG NHIá»€U KEY)
// ==========================================
const GEMINI_API_KEYS = [
    'AIzaSyBDRhMmDDOuI-ILHMXzEPMwqxCa5T7v_-c'
];
let currentApiKeyIndex = 0;
let supabaseClient = null;
let currentUser = null;
let currentChatId = null;

// Cấu hình Marked với KaTeX để render công thức toán học
if (window.marked && window.katex) {
    const mathExtension = {
        name: 'math',
        level: 'inline',
        start(src) { return src.match(/\$|\\\[|\\\(/)?.index; },
        tokenizer(src) {
            const blockRule = /^\$\$([^$]+)\$\$/;
            const inlineRule = /^\$([^$\n]+)\$/;
            const blockRule2 = /^\\\[(.*?)\\\]/s;
            const inlineRule2 = /^\\\((.*?)\\\)/s;
            const match = blockRule.exec(src) || inlineRule.exec(src) || blockRule2.exec(src) || inlineRule2.exec(src);
            if (match) {
                return {
                    type: 'math',
                    raw: match[0],
                    text: match[1].trim(),
                    displayMode: match[0].startsWith('$$') || match[0].startsWith('\\[')
                };
            }
        },
        renderer(token) {
            try {
                return katex.renderToString(token.text, { displayMode: token.displayMode, throwOnError: false });
            } catch (e) {
                return token.raw;
            }
        }
    };
    marked.use({ extensions: [mathExtension] });
}

// Khá»Ÿi táº¡o Supabase an toÃ n
try {
    if (window.supabase) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("Supabase Ä‘Ã£ khá»Ÿi táº¡o thÃ nh cÃ´ng.");
    } else {
        console.error("Lá»—i: KhÃ´ng tÃ¬m tháº¥y thÆ° viá»‡n Supabase (CÃ³ thá»ƒ do máº¡ng cháº­m hoáº·c bá»‹ trÃ¬nh duyá»‡t cháº·n).");
    }
} catch (e) {
    console.error("Lá»—i khá»Ÿi táº¡o Supabase:", e);
}

const handleGoogleLogin = async () => {
    console.log("NÃºt Ä‘Äƒng nháº­p Ä‘Æ°á»£c click!");
    if (!supabaseClient) {
        alert("Lá»—i: Supabase chÆ°a Ä‘Æ°á»£c táº£i. HÃ£y kiá»ƒm tra káº¿t ná»‘i máº¡ng hoáº·c táº¯t tiá»‡n Ã­ch cháº·n quáº£ng cÃ¡o.");
        return;
    }
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
    });
    if (error) {
        console.error("Lá»—i Ä‘Äƒng nháº­p:", error.message);
        alert("CÃ³ lá»—i khi Ä‘Äƒng nháº­p: " + error.message);
    }
};

// Xá»­ lÃ½ nÃºt Ä Äƒng nháº­p Google
document.getElementById('googleLoginBtn')?.addEventListener('click', handleGoogleLogin);
document.getElementById('sidebarLoginBtn')?.addEventListener('click', handleGoogleLogin);

// Kiá»ƒm tra phiÃªn Ä‘Äƒng nháº­p khi táº£i trang
window.addEventListener('load', async () => {
    // áº¨n hiá»‡u á»©ng loading
    const pageLoader = document.getElementById('pageLoader');
    if (pageLoader) {
        pageLoader.classList.add('hidden');
        setTimeout(() => pageLoader.style.display = 'none', 600);
    }

    if (!supabaseClient) return;

    // Láº¥y session hiá»‡n táº¡i
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (session) {
        handleUserLogin(session.user);
    } else {
        loadChatHistory(null);
    }

    // Láº¯ng nghe sá»± thay Ä‘á»•i tráº¡ng thÃ¡i Ä‘Äƒng nháº­p
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
            handleUserLogin(session.user);
        } else if (event === 'SIGNED_OUT') {
            handleUserLogout();
        }
    });

    // Tá»± Ä‘á»™ng táº£i danh sÃ¡ch model mÃ  API Key há»— trá»£
    // loadAvailableModels();
});

async function loadAvailableModels() {
    const apiKey = GEMINI_API_KEYS[0];
    if (!apiKey) return;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();

        if (data.models) {
            const select = document.getElementById('modelSelect');
            select.innerHTML = ''; // XÃ³a cÃ¡c lá»±a chá»n cÅ©

            data.models.forEach(model => {
                // Chá»‰ láº¥y nhá»¯ng model há»— trá»£ generateContent (Chat)
                if (model.supportedGenerationMethods && model.supportedGenerationMethods.includes("generateContent")) {
                    const option = document.createElement('option');
                    // data tráº£ vá» dáº¡ng "models/gemini-pro", ta chá»‰ cáº§n chuá»—i Ä‘áº±ng sau
                    option.value = model.name.replace('models/', '');
                    option.textContent = model.displayName || option.value;
                    select.appendChild(option);
                }
            });
            // Tá»± Ä‘á»™ng chá»n gemini-flash-latest hoáº·c gemini-3.5-flash lÃ m máº·c Ä‘á»‹nh náº¿u cÃ³
            if (Array.from(select.options).some(opt => opt.value === 'gemini-flash-latest')) {
                select.value = 'gemini-flash-latest';
            } else if (Array.from(select.options).some(opt => opt.value === 'gemini-3.5-flash')) {
                select.value = 'gemini-3.5-flash';
            } else if (Array.from(select.options).some(opt => opt.value === 'gemini-3.1-flash-lite')) {
                select.value = 'gemini-3.1-flash-lite';
            }
            
            console.log("ÄÃ£ táº£i danh sÃ¡ch Model thÃ nh cÃ´ng!");
        } else if (data.error) {
            console.error("Lá»—i API Key khi láº¥y danh sÃ¡ch model:", data.error.message);
        }
    } catch (e) {
        console.error("KhÃ´ng thá»ƒ táº£i danh sÃ¡ch model:", e);
    }
}

function handleUserLogin(user) {
    currentUser = user;

    // áº¨n nÃºt Ä‘Äƒng nháº­p, hiá»‡n avatar
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    if (googleLoginBtn) googleLoginBtn.style.display = 'none';
    
    const sidebarLoginBtn = document.getElementById('sidebarLoginBtn');
    if (sidebarLoginBtn) sidebarLoginBtn.style.display = 'none';

    // Avatar gÃ³c trÃªn
    const topAvatar = document.getElementById('topAvatar');
    if (topAvatar) {
        topAvatar.style.display = 'block';
        topAvatar.innerHTML = `<img src="${user.user_metadata.avatar_url}" alt="Avatar" style="width: 100%; border-radius: 50%;">`;
    }

    // Profile gÃ³c dÆ°á»›i
    const userProfile = document.getElementById('userProfile');
    if (userProfile) {
        userProfile.style.display = 'flex';
        document.getElementById('userAvatar').innerHTML = `<img src="${user.user_metadata.avatar_url}" style="width: 100%; border-radius: 50%;">`;
        document.getElementById('userName').textContent = user.user_metadata.full_name;
    }
    
    // Cáº­p nháº­t thÃ´ng tin trong Account Modal
    const modalEmail = document.getElementById('modalEmail');
    const modalGreeting = document.getElementById('modalGreeting');
    const accountModalAvatar = document.getElementById('accountModalAvatar');
    
    if (modalEmail) modalEmail.textContent = user.email;
    if (modalGreeting) {
        const nameParts = user.user_metadata.full_name.split(' ');
        const firstName = nameParts[nameParts.length - 1];
        modalGreeting.textContent = `Chào ${firstName},`;
    }
    if (accountModalAvatar) {
        accountModalAvatar.innerHTML = `<img src="${user.user_metadata.avatar_url}" style="width: 100%; border-radius: 50%;">`;
    }
    
    // Render các tài khoản phụ
    renderMockAccounts(user.email);

    // TODO: Tải lịch sử chat từ cơ sở dữ liệu (Giai đoạn 3)
    loadChatHistory(user.id);
}

function renderMockAccounts(currentEmail) {
    const allAccounts = [
        { name: 'Đại Trọng', email: 'trongdai061211@gmail.com', bg: '#e65100', initial: 'Đ' },
        { name: 'Minh Mạnh', email: 'minhmanh0910@gmail.com', bg: '#5c6bc0', initial: 'M' },
        { name: 'Mạnh Minh', email: 'mnhmanh0910@gmail.com', bg: '#0288d1', initial: 'M' },
        { name: 'Trọng Đại', email: 'tdai061211@gmail.com', bg: '#9c27b0', initial: 'T' }
    ];

    const container = document.getElementById('mockAccountsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    const current = (currentEmail || '').toLowerCase().trim();
    
    allAccounts.forEach(acc => {
        if (acc.email.toLowerCase().trim() !== current) {
            const div = document.createElement('div');
            div.className = 'account-list-item';
            div.innerHTML = `
                <div class="avatar-small" style="background:${acc.bg};">${acc.initial}</div>
                <div class="account-details">
                    <div class="account-name">${acc.name}</div>
                    <div class="account-email">${acc.email}</div>
                </div>
                <div class="account-status">Đã đăng xuất</div>
            `;
            
            // ThÃªm sá»± kiá»‡n click
            div.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (supabaseClient) {
                    await supabaseClient.auth.signInWithOAuth({
                        provider: 'google',
                        options: {
                            queryParams: {
                                prompt: 'select_account'
                            }
                        }
                    });
                }
            });
            
            container.appendChild(div);
        }
    });
}

// Xá»­ lÃ½ nÃºt ÄÄƒng xuáº¥t
document.getElementById('logoutBtn').addEventListener('click', async () => {
    if (supabaseClient) {
        await supabaseClient.auth.signOut();
    }
});

function handleUserLogout() {
    currentUser = null;
    currentChatId = null;
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    if (googleLoginBtn) googleLoginBtn.style.display = 'flex';
    const sidebarLoginBtn = document.getElementById('sidebarLoginBtn');
    if (sidebarLoginBtn) sidebarLoginBtn.style.display = 'flex';
    document.getElementById('topAvatar').style.display = 'none';
    document.getElementById('userProfile').style.display = 'none';
    
    loadChatHistory(null);
    
    // ÄÃ³ng cÃ¡c báº£ng cÃ i Ä‘áº·t vÃ  tÃ i khoáº£n náº¿u Ä‘ang má»Ÿ
    const accountModal = document.getElementById('accountModal');
    if (accountModal) accountModal.classList.remove('active');
    const settingsDropdown = document.getElementById('settingsDropdown');
    if (settingsDropdown) settingsDropdown.classList.remove('active');

    // XÃ³a chat container
    chatContainer.innerHTML = `
        <div class="welcome-screen" id="welcomeScreen">
            <h1 class="greeting">ChÃºng ta nÃªn báº¯t Ä‘áº§u tá»« Ä‘Ã¢u nhá»‰?</h1>
        </div>
    `;
    welcomeScreen = document.getElementById("welcomeScreen");
}

async function loadChatHistory(userId) {
    const recentList = document.querySelector('.recent-list');
    if (!recentList) return;
    recentList.innerHTML = '<div class="recent-title" style="padding:10px; font-weight:normal; color:#5f6368;">Ä ang táº£i lá»‹ch sá»­...</div>';

    try {
        let data = [];
        if (!userId || !supabaseClient) {
            data = JSON.parse(localStorage.getItem('localChats') || '[]');
        } else {
            const { data: dbData, error } = await supabaseClient
                .from('chats')
                .select('id, title, created_at')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            data = dbData || [];
        }

        if (data.length === 0) {
            recentList.innerHTML = '<div class="recent-title" style="padding:10px; font-weight:normal; color:#5f6368;">Chưa có lịch sử trò chuyện.</div>';
            return;
        }

        recentList.innerHTML = '';
        const pinnedList = document.querySelector('.pinned-list');
        const pinnedSection = document.getElementById('pinnedSection');
        if (pinnedList) pinnedList.innerHTML = '';
        
        let pinnedChatsKey = userId ? 'pinnedChats_' + userId : 'pinnedChats_local';
        let pinnedChats = JSON.parse(localStorage.getItem(pinnedChatsKey) || "[]");
        let hasPinned = false;

        data.forEach(chat => {
            const isPinned = pinnedChats.includes(chat.id);
            const div = document.createElement('div');
            div.className = 'recent-item';
            if (chat.id === currentChatId) div.classList.add('active');
            
            const iconSvg = isPinned 
                ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" style="transform: rotate(45deg);"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>`
                : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`;

            div.innerHTML = `
                <div class="chat-title-group">
                    ${iconSvg}
                    <span>${escapeHTML(chat.title)}</span>
                </div>
                <div class="chat-options-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1.5"></circle><circle cx="12" cy="5" r="1.5"></circle><circle cx="12" cy="19" r="1.5"></circle></svg>
                </div>
            `;
            
            const titleGroup = div.querySelector('.chat-title-group');
            if (titleGroup) {
                titleGroup.onclick = (e) => {
                    e.stopPropagation();
                    openChat(chat.id);
                };
            }
            
            const optionsBtn = div.querySelector('.chat-options-btn');
            if (optionsBtn) {
                optionsBtn.onclick = (e) => {
                    e.stopPropagation();
                    openChatMenu(e, chat.id, chat.title, optionsBtn);
                };
            }
            
            if (isPinned && pinnedList) {
                pinnedList.appendChild(div);
                hasPinned = true;
            } else {
                recentList.appendChild(div);
            }
        });
        
        if (pinnedSection) {
            pinnedSection.style.display = hasPinned ? 'block' : 'none';
        }
    } catch (e) {
        console.error("Lỗi tải lịch sử chat:", e);
        recentList.innerHTML = '<div class="recent-title" style="padding:10px; font-weight:normal; color:#c5221f;">Lá»—i táº£i lá»‹ch sá»­.</div>';
    }
}

async function openChat(chatId) {
    let chatData = null;
    if (chatId.toString().startsWith('local_')) {
        let localChats = JSON.parse(localStorage.getItem('localChats') || '[]');
        chatData = localChats.find(c => c.id === chatId);
        if (!chatData) return;
    } else {
        if (!supabaseClient || !currentUser) return;
        const { data, error } = await supabaseClient
            .from('chats')
            .select('*')
            .eq('id', chatId)
            .single();

        if (error || !data) {
            console.error("Lá»—i má»Ÿ chat:", error);
            return;
        }
        chatData = data;
    }

    currentChatId = chatId;

    // Highlight sidebar
    loadChatHistory(currentUser ? currentUser.id : null);

    // Hiá»‡u á»©ng má»  dáº§n (fade out)
    const chatWrapper = document.getElementById('chatWrapper');
    chatWrapper.style.transition = 'none';
    chatWrapper.style.opacity = '0';

    // Ä Ã³ng sidebar trÃªn mobile náº¿u Ä‘ang má»Ÿ
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar && sidebar.classList.contains('mobile-open')) {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
    }

    // Render láº¡i toÃ n bá»™ chat
    chatContainer.innerHTML = '';
    const messages = chatData.messages || [];

    messages.forEach(msg => {
        if (msg.role === 'user') {
            appendUserMessage(msg.content, false, msg.image);
        } else {
            appendAIMessage(msg.content, false);
        }
    });
    
    scrollToBottom();
    
    // Fade in
    setTimeout(() => {
        chatWrapper.style.transition = 'opacity 0.3s ease';
        chatWrapper.style.opacity = '1';
    }, 50);
}

// Xử lý tạo cuộc trò chuyện mới
document.getElementById('newChatBtn').addEventListener('click', async () => {
    const chatWrapper = document.getElementById('chatWrapper');
    chatWrapper.style.transition = 'none';
    chatWrapper.style.opacity = '0';

    // Đóng sidebar trên mobile nếu đang mở
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar && sidebar.classList.contains('mobile-open')) {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
    }

    if (currentUser && supabaseClient) {
        const { data, error } = await supabaseClient
            .from('chats')
            .insert([{
                user_id: currentUser.id,
                title: "Cuộc trò chuyện mới",
                messages: []
            }])
            .select('id')
            .single();
            
        if (!error && data) {
            currentChatId = data.id;
        } else {
            currentChatId = null;
        }
    } else {
        const newId = 'local_' + Date.now();
        let localChats = JSON.parse(localStorage.getItem('localChats') || '[]');
        localChats.unshift({
            id: newId,
            title: "Cuộc trò chuyện mới",
            messages: [],
            created_at: new Date().toISOString()
        });
        localStorage.setItem('localChats', JSON.stringify(localChats));
        currentChatId = newId;
    }

    chatContainer.innerHTML = `
        <div class="welcome-screen" id="welcomeScreen">
            <h1 class="greeting">Chúng ta nên bắt đầu từ đâu nhỉ?</h1>
        </div>
    `;
    welcomeScreen = document.getElementById("welcomeScreen");
    if (currentUser) {
        loadChatHistory(currentUser.id);
    } else {
        loadChatHistory(null);
    }
    
    setTimeout(() => {
        chatWrapper.style.transition = 'opacity 0.3s ease';
        chatWrapper.style.opacity = '1';
    }, 50);
});

// ==========================================
// Xá»¬ LÃ  GIAO DIá»†N CHAT
// ==========================================

const chatContainer = document.getElementById("chatContainer");
let welcomeScreen = document.getElementById("welcomeScreen"); // Chuyá»ƒn thÃ nh let Ä‘á»ƒ gÃ¡n láº¡i
const messageInput = document.getElementById("message");

// ThÃªm sá»± kiá»‡n nháº¥n phÃ­m Enter Ä‘á»ƒ gá»­i tin nháº¯n
messageInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        sendMessage();
    }
});

// ==========================================
// Xá»¬ LÃ  MENU Ä Ã NH KÃˆM
// ==========================================
let attachedImageData = null;
let isImageGenerationMode = false;

const attachmentBtn = document.getElementById('attachmentBtn');
const attachmentMenu = document.getElementById('attachmentMenu');
const webSearchToggle = document.getElementById('webSearchToggle');
const optUploadImage = document.getElementById('optUploadImage');
const imageUploadInput = document.getElementById('imageUploadInput');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');
const imagePreview = document.getElementById('imagePreview');
const removeImageBtn = document.getElementById('removeImageBtn');

if (attachmentBtn && attachmentMenu) {
    attachmentBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        attachmentMenu.classList.toggle('active');
    });

    window.addEventListener('click', (e) => {
        if (!attachmentMenu.contains(e.target) && !attachmentBtn.contains(e.target)) {
            attachmentMenu.classList.remove('active');
        }
    });
}

// Hàm nén ảnh giảm dung lượng để tránh giật lag (đặc biệt trên điện thoại)
function compressImage(file, maxWidth, maxHeight, quality) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = event => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round(height *= maxWidth / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round(width *= maxHeight / height);
                        height = maxHeight;
                    }
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = error => reject(error);
        };
        reader.onerror = error => reject(error);
    });
}

if (optUploadImage && imageUploadInput) {
    optUploadImage.addEventListener('click', () => {
        imageUploadInput.click();
        attachmentMenu.classList.remove('active');
    });

    async function handleImageFile(file) {
        try {
            // Hiển thị tạm ảnh để người dùng biết đang tải
            imagePreview.src = "https://i.gifer.com/ZKZg.gif"; 
            imagePreviewContainer.style.display = 'inline-block';
            
            // Nén ảnh xuống tối đa 1024x1024, chất lượng 70%
            const compressedDataUrl = await compressImage(file, 1024, 1024, 0.7);
            const base64Data = compressedDataUrl.split(',')[1];
            
            attachedImageData = {
                inlineData: {
                    mimeType: 'image/jpeg', // Canvas toDataURL trả về jpeg
                    data: base64Data
                }
            };
            // Hiển thị ảnh thật sau khi nén xong
            imagePreview.src = compressedDataUrl;
        } catch (err) {
            console.error("Lỗi nén ảnh:", err);
            alert("Không thể xử lý ảnh này. Dung lượng có thể quá lớn, vui lòng thử lại.");
            imagePreviewContainer.style.display = 'none';
        }
    }

    imageUploadInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            await handleImageFile(file);
        }
    });

    // Thêm tính năng paste (dán) ảnh
    document.addEventListener('paste', async (e) => {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (let index in items) {
            const item = items[index];
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) {
                    await handleImageFile(file);
                    // Ngăn chặn hành vi paste mặc định nếu đang ở trong input/textarea để tránh text rác
                    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
                        e.preventDefault();
                    }
                }
            }
        }
    });
}

if (removeImageBtn) {
    removeImageBtn.addEventListener('click', () => {
        attachedImageData = null;
        imagePreview.src = "";
        imagePreviewContainer.style.display = 'none';
        imageUploadInput.value = "";
    });
}

async function sendMessage() {
    const message = messageInput.value.trim();
    if (message === "" && !attachedImageData) return;

    // Láº¥y áº£nh Ä‘Ã­nh kÃ¨m hiá»‡n táº¡i
    let currentAttachedImageData = null;
    if (attachedImageData) {
        currentAttachedImageData = {...attachedImageData};
    }
    
    // Reset tÃ­nh nÄƒng sau khi báº¥m gá»­i
    if (attachedImageData) {
        attachedImageData = null;
        imagePreview.src = "";
        imagePreviewContainer.style.display = 'none';
        imageUploadInput.value = "";
    }

    // áº¨n mÃ n hÃ¬nh chÃ o má»«ng náº¿u cÃ³
    if (welcomeScreen) {
        welcomeScreen.style.display = 'none';
    }

    // Xóa nội dung input và reset placeholder
    messageInput.value = "";
    messageInput.placeholder = "Hỏi DocBot hoặc tìm kiếm tài liệu...";

    // 1. ThÃªm bong bÃ³ng chat cá»§a ngÆ°á» i dÃ¹ng
    let userImgBase64 = null;
    if (currentAttachedImageData && currentAttachedImageData.inlineData) {
        userImgBase64 = `data:${currentAttachedImageData.inlineData.mimeType};base64,${currentAttachedImageData.inlineData.data}`;
    }
    
    // Tự động nhận diện ý định tạo ảnh qua câu lệnh (không cần bấm nút)
    const imageIntentRegex = /^(tạo ảnh|vẽ ảnh|vẽ hình|vẽ con|tạo hình|tạo bức ảnh|vẽ bức ảnh|tạo ra ảnh|vẽ ra ảnh|tạo ra con|vẽ ra con|tạo con|vẽ một|tạo một bức|vẽ một bức|generate image|draw a|create an image)/i;
    const isAutoImageMode = imageIntentRegex.test(message);
    
    // Nếu đang ở chế độ tạo ảnh AI (hoặc tự động nhận diện)
    if (isImageGenerationMode || isAutoImageMode) {
        isImageGenerationMode = false;
        messageInput.placeholder = "Hỏi DocBot hoặc tìm kiếm tài liệu...";
        
        // Nếu tự gõ thì không cần thêm chữ "Tạo ảnh với mô tả", chỉ hiển thị nguyên văn
        const displayMsg = isAutoImageMode && !isImageGenerationMode ? message : `Tạo ảnh với mô tả: "${message}"`;
        appendUserMessage(displayMsg, true, userImgBase64);
        const loadingId = "loading-" + Date.now();
        
        // Custom loading cho tạo ảnh
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'chat-bubble ai-bubble';
        loadingDiv.id = loadingId;
        loadingDiv.innerHTML = `
            <div class="ai-avatar">✨</div>
            <div class="bubble-content">
                <div class="status-box status-success">Docbot đang vẽ ảnh (có thể mất 10-20 giây)...</div>
            </div>
        `;
        document.getElementById("chatContainer").appendChild(loadingDiv);
        scrollToBottom();
        
        try {
            // Dịch prompt tiếng Việt sang tiếng Anh
            let englishPrompt = message;
            try {
                const transRes = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=vi&tl=en&dt=t&q=${encodeURIComponent(message)}`);
                const transData = await transRes.json();
                if (transData && transData[0] && transData[0][0] && transData[0][0][0]) {
                    englishPrompt = transData[0][0][0];
                }
            } catch (e) {
                console.warn("Lỗi dịch prompt:", e);
            }
            
            const hfToken = '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';
            // Gọi qua Cloudflare Worker để lách luật chặn DNS của nhà mạng VN
            const hfUrl = 'https://tailieu-ai.mnhmanh0910.workers.dev/hf-proxy';
            
            let imageUrl = '';
            try {
                const response = await fetch(hfUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${hfToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ inputs: englishPrompt })
                });

                if (!response.ok) {
                    throw new Error("Server tạo ảnh đang quá tải hoặc lỗi mạng. Vui lòng thử lại sau.");
                }

                const blob = await response.blob();
                imageUrl = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            } catch (apiError) {
                throw new Error(apiError.message || "Lỗi kết nối.");
            }
            
            const finalHtml = `
                <div style="margin-top: 10px;">
                    <p>Đây là ảnh tạo theo yêu cầu của bạn (Bởi <b>FLUX.1</b> - Không lo bị chặn nữa 🎉):</p>
                    <img src="${imageUrl}" style="max-width: 100%; border-radius: 8px; margin-top: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" alt="AI Generated Image" onload="scrollToBottom()">
                </div>
            `;
            
            const bubbleEl = document.getElementById(loadingId);
            bubbleEl.innerHTML = `
                <div class="chat-avatar bot-avatar">✨</div>
                <div class="chat-bubble bot-bubble" style="background: transparent; border: none; box-shadow: none; padding: 0;">
                    ${finalHtml}
                </div>
            `;
            
            await saveChatToDB(`Tạo ảnh với mô tả: "${message}"`, finalHtml, userImgBase64);
        } catch (e) {
            console.error("Lỗi tạo ảnh:", e);
            document.getElementById(loadingId).innerHTML = `
                <div class="chat-avatar bot-avatar">✨</div>
                <div class="chat-bubble bot-bubble">
                    <div class="status-box status-warning">Lỗi tạo ảnh: ${escapeHTML(e.message)}</div>
                </div>
            `;
        }
        return;
    }
    
    appendUserMessage(message, true, userImgBase64);

    // Lấy lịch sử chat hiện tại để làm ngữ cảnh cho Gemini
    let previousMessages = [];
    try {
        if (currentChatId) {
            if (currentChatId.toString().startsWith('local_')) {
                let localChats = JSON.parse(localStorage.getItem('localChats') || '[]');
                let chat = localChats.find(c => c.id === currentChatId);
                if (chat) previousMessages = chat.messages || [];
            } else if (supabaseClient) {
                const { data } = await supabaseClient
                    .from('chats')
                    .select('messages')
                    .eq('id', currentChatId)
                    .single();
                if (data) previousMessages = data.messages || [];
            }
        }
    } catch (e) {
        console.error("Lỗi lấy lịch sử chat:", e);
    }

    // 2. ThÃªm bong bÃ³ng "Ä‘ang gÃµ" cá»§a A.I
    const loadingId = "loading-" + Date.now();
    appendAILoading(loadingId);

    // Cuá»™n xuá»‘ng cuá»‘i
    scrollToBottom();

    try {
        // 1. TÃŒM KIáº¾M VÃ€ Ä á»ŒC TÃ€I LIá»†U TRÆ¯á»šC (RAG)
        let workerText = "";
        let foundFiles = [];
        let workerHtml = "";

        try {
            const workerData = await fetchDocumentSearch(message);
            if (workerData.success && workerData.files && workerData.files.length > 0) {
                foundFiles = workerData.files;
                
                // Hiển thị danh sách file tìm được
                workerHtml += `<div class="worker-results" style="margin-bottom: 10px;">
                    <div style="font-weight: 500; color: #1a73e8; margin-bottom: 8px; font-size: 0.9em; display: flex; align-items: center; gap: 4px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        Tài liệu tham khảo:
                    </div>`;
                foundFiles.forEach(f => {
                    const icon = f.type === 'folder' ? '📁' : '📄';
                    workerHtml += `<a href="${f.link}" target="_blank" class="file-link">
                        <span class="file-icon">${icon}</span>
                        <span class="file-name">${escapeHTML(f.name)}</span>
                    </a>`;
                });
                workerHtml += `</div>`;

                // Update UI để báo đang đọc file
                document.getElementById(loadingId).innerHTML = `
                    <div class="ai-avatar">✨</div>
                    <div class="bubble-content">
                        ${workerHtml}
                        <div class="status-box status-success" style="margin-top: 10px;">Đang đọc nội dung tài liệu để trả lời...</div>
                    </div>
                `;

                // TrÃ­ch xuáº¥t ná»™i dung file (Tá»‘i Ä‘a 2 file Ä‘á»ƒ trÃ¡nh quÃ¡ táº£i)
                const filesToRead = foundFiles.filter(f => f.type === "file").slice(0, 2);
                for (const f of filesToRead) {
                    try {
                        const res = await fetch(`${WORKER_URL}download?id=${f.id}&mimeType=${encodeURIComponent(f.mimeType)}`);
                        if (res.ok) {
                            const binaryMimes = [
                                "application/pdf", 
                                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                "application/msword",
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                "application/vnd.ms-excel"
                            ];
                            if (binaryMimes.includes(f.mimeType) || f.mimeType.startsWith("image/")) {
                                // Xử lý qua base64 cho PDF, Word, Excel, Hình ảnh
                                const blob = await res.blob();
                                const base64 = await new Promise((resolve) => {
                                    const reader = new FileReader();
                                    reader.onloadend = () => resolve(reader.result.split(',')[1]);
                                    reader.readAsDataURL(blob);
                                });
                                f.inlineData = { mimeType: f.mimeType, data: base64 };
                            } else {
                                // CÃ¡c file dáº¡ng Text / Google Docs
                                const text = await res.text();
                                workerText += `\n--- TÃ i liá»‡u: ${f.name} ---\n${text.substring(0, 15000)}\n`;
                            }
                        }
                    } catch (e) {
                        console.error("Lá»—i Ä‘á» c file:", f.name, e);
                    }
                }
            } else if (workerData.error && !workerData.skipErrorUI) {
                // Kiá»ƒm tra xem Ä‘Ã¢y cÃ³ pháº£i lÃ  cÃ¢u há» i giao tiáº¿p thÃ´ng thÆ°á» ng hay khÃ´ng
                const isSearchIntent = /tÃ¬m|tÃ i liá»‡u|Ä‘á»  thi|chuyÃªn Ä‘á» |bÃ i táº­p|file|folder|thÆ° má»¥c|tÃ³m táº¯t|sÃ¡ch|Ä‘Ã¡p Ã¡n|tìm|tài liệu|đề thi|chuyên đề|bài tập|thư mục|tóm tắt|sách|đáp án/i.test(message);
                const isConversational = /báº¡n|chÃ o|cáº£m Æ¡n|Æ¡i|Ã |nhÃ©|nha|nhá»‰|khÃ´ng\s*\?|lÃ \s+gÃ¬|ai|bạn|chào|cảm ơn|ơi|à|nhé|nha|nhỉ|không|là gì/i.test(message);
                
                // Chỉ hiện lỗi tìm kiếm nếu người dùng CÓ ý định tìm kiếm, 
                // HOẶC nếu câu đó KHÔNG PHẢI là câu giao tiếp (như gõ tên file cụ thể)
                if (isSearchIntent || (!isConversational && message.length >= 5)) {
                    const errorStr = typeof workerData.error === 'string' ? workerData.error : (workerData.error.message || JSON.stringify(workerData.error));
                    workerHtml += `<div class="status-box status-warning">Lỗi tìm tài liệu: ${escapeHTML(errorStr)}</div>`;
                }
            }
        } catch (e) {
            console.error("Lỗi fetchDocumentSearch:", e);
            workerHtml += `<div class="status-box status-warning">Không thể kết nối tới kho tài liệu. Lỗi: ${e.message}</div>`;
        }

        // 2. Gá»ŒI GEMINI Vá»šI KIáº¾N THá»¨C Tá»ª TÃ€I LIá»†U
        let finalHtml = workerHtml;
        const bubbleEl = document.getElementById(loadingId);
        bubbleEl.innerHTML = `
            <div class="chat-avatar bot-avatar">✨</div>
            <div class="chat-bubble bot-bubble">
                ${finalHtml}
            </div>
        `;
        const contentEl = bubbleEl.querySelector('.bot-bubble');

        try {
            if (currentAttachedImageData) {
                foundFiles.push(currentAttachedImageData);
            }
            const aiText = await fetchGeminiResponse(message, workerText, foundFiles, previousMessages, (chunkText) => {
                let tempHtml = workerHtml;
                tempHtml += `<div class="markdown-body" style="margin-top: 15px;">${marked.parse(chunkText)}</div>`;
                contentEl.innerHTML = tempHtml;
                scrollToBottom();
            });
            finalHtml += `<div class="markdown-body" style="margin-top: 15px;">${marked.parse(aiText)}</div>`;
            contentEl.innerHTML = finalHtml;
        } catch (e) {
            console.error("Lỗi Gemini:", e);
            finalHtml += `<div class="status-box status-warning" style="margin-top: 15px;">
                <strong>⚠️ Lỗi Gemini:</strong><br>
                ${escapeHTML(e.message || "Đang không thể trả lời ngay lúc này.")}
            </div>`;
            contentEl.innerHTML = finalHtml;
        }

        scrollToBottom();

        // 4. LÆ°u vÃ o Database (náº¿u Ä‘Ã£ Ä‘Äƒng nháº­p) hoáº·c LocalStorage
        await saveChatToDB(message, finalHtml, userImgBase64);



    } catch (error) {
        console.error(error);
        removeElement(loadingId);
        appendAIMessage(`<div class="status-box status-error"><strong>❌ Lỗi kết nối:</strong> Không thể kết nối tới server.<br>${error.message}</div>`);
        scrollToBottom();
    }
}

async function saveChatToDB(userText, aiHtml, userImageBase64 = null) {
    try {
        if (!currentUser || !supabaseClient) {
            let localChats = JSON.parse(localStorage.getItem('localChats') || '[]');
            if (!currentChatId) {
                const title = userText.length > 30 ? userText.substring(0, 30) + "..." : userText;
                const newId = 'local_' + Date.now();
                const newMessages = [
                    { role: 'user', content: userText, image: userImageBase64 },
                    { role: 'ai', content: aiHtml }
                ];
                localChats.unshift({
                    id: newId,
                    title: title,
                    messages: newMessages,
                    created_at: new Date().toISOString()
                });
                currentChatId = newId;
                localStorage.setItem('localChats', JSON.stringify(localChats));
                loadChatHistory(null);
            } else {
                let chatIndex = localChats.findIndex(c => c.id === currentChatId);
                if (chatIndex !== -1) {
                    let chat = localChats[chatIndex];
                    chat.messages = chat.messages || [];
                    chat.messages.push({ role: 'user', content: userText, image: userImageBase64 });
                    chat.messages.push({ role: 'ai', content: aiHtml });
                    if (chat.title === "Cuộc trò chuyện mới") {
                        chat.title = userText.length > 30 ? userText.substring(0, 30) + "..." : userText;
                    }
                    localStorage.setItem('localChats', JSON.stringify(localChats));
                    loadChatHistory(null);
                }
            }
            return;
        }

        if (!currentChatId) {
            // Táº¡o chat má»›i
            const title = userText.length > 30 ? userText.substring(0, 30) + "..." : userText;
            const newMessages = [
                { role: 'user', content: userText, image: userImageBase64 },
                { role: 'ai', content: aiHtml }
            ];

            const { data, error } = await supabaseClient
                .from('chats')
                .insert([{
                    user_id: currentUser.id,
                    title: title,
                    messages: newMessages
                }])
                .select('id')
                .single();

            if (error) throw error;
            currentChatId = data.id;
            loadChatHistory(currentUser.id); // Táº£i láº¡i sidebar
        } else {
            // Lấy tin nhắn cũ
            const { data: chatData, error: fetchErr } = await supabaseClient
                .from('chats')
                .select('title, messages')
                .eq('id', currentChatId)
                .single();

            if (fetchErr) throw fetchErr;

            let messages = chatData.messages || [];
            messages.push({ role: 'user', content: userText, image: userImageBase64 });
            messages.push({ role: 'ai', content: aiHtml });

            let updatePayload = { messages: messages };
            let titleRenamed = false;
            if (chatData.title === "Cuộc trò chuyện mới") {
                updatePayload.title = userText.length > 30 ? userText.substring(0, 30) + "..." : userText;
                titleRenamed = true;
            }

            const { error: updateErr } = await supabaseClient
                .from('chats')
                .update(updatePayload)
                .eq('id', currentChatId);

            if (updateErr) throw updateErr;
            
            if (titleRenamed && currentUser) {
                loadChatHistory(currentUser.id);
            }
        }
    } catch (e) {
        console.error("Lỗi lưu chat:", e);
    }
}

function appendUserMessage(text, animate = true, imageBase64 = null) {
    const div = document.createElement('div');
    div.className = 'chat-bubble user-bubble' + (animate ? '' : ' no-animation');
    
    let htmlContent = '';
    if (imageBase64) {
        htmlContent += `<img src="${imageBase64}" style="max-width:100%; max-height:200px; border-radius:8px; margin-bottom:8px; display:block;">`;
    }
    if (text) {
        htmlContent += escapeHTML(text).replace(/\n/g, '<br>');
    }
    
    // Bọc nội dung tin nhắn và thanh công cụ
    div.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: flex-end;">
            <div class="bubble-content">${htmlContent}</div>
            <div class="user-action-bar" style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 6px; opacity: 0; transition: opacity 0.2s;">
                <button class="copy-btn" title="Copy tin nhắn" style="color: #10a37f; cursor: pointer; padding: 6px; border: none; background: rgba(16, 163, 127, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
                <button class="edit-btn" title="Chỉnh sửa tin nhắn" style="color: #f59e0b; cursor: pointer; padding: 6px; border: none; background: rgba(245, 158, 11, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
            </div>
        </div>
    `;
    
    const contentDiv = div.querySelector('.bubble-content');
    contentDiv.addEventListener('contextmenu', (e) => {
        if (window.innerWidth <= 768) {
            e.preventDefault();
            mobileMenuContainer.style.display = 'flex';
            const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
            const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
            
            setTimeout(() => {
                const rect = mobileMenuContainer.getBoundingClientRect();
                let left = clientX - (rect.width / 2);
                if (left < 10) left = 10;
                if (left + rect.width > window.innerWidth - 10) left = window.innerWidth - rect.width - 10;
                
                let top = clientY + 10;
                if (top + rect.height > window.innerHeight - 10) top = clientY - rect.height - 10;
                
                mobileMenuContainer.style.left = left + 'px';
                mobileMenuContainer.style.top = top + 'px';
                mobileMenuContainer.style.opacity = '1';
            }, 10);
            
            document.getElementById('mcm-edit').onclick = () => {
                mobileMenuContainer.style.opacity = '0';
                setTimeout(() => mobileMenuContainer.style.display = 'none', 200);
                const editBtn = div.querySelector('.edit-btn');
                if (editBtn) editBtn.click();
            };
            document.getElementById('mcm-copy').onclick = () => {
                mobileMenuContainer.style.opacity = '0';
                setTimeout(() => mobileMenuContainer.style.display = 'none', 200);
                const copyBtn = div.querySelector('.copy-btn');
                if (copyBtn) copyBtn.click();
            };
        }
    });
    
    // Thêm event listeners cho các nút
    const copyBtn = div.querySelector('.copy-btn');
    if (copyBtn && text) {
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(text);
            copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10a37f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            setTimeout(() => {
                copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
            }, 2000);
        };
    } else if (copyBtn) {
        copyBtn.style.display = 'none'; // Không hiện nút copy nếu chỉ có ảnh
    }

    const editBtn = div.querySelector('.edit-btn');
    if (editBtn && text) {
        editBtn.onclick = () => {
            const wrapper = div.querySelector('div');
            const contentDiv = div.querySelector('.bubble-content');
            const actionBar = div.querySelector('.user-action-bar');
            
            contentDiv.style.display = 'none';
            actionBar.style.display = 'none';
            
            const editContainer = document.createElement('div');
            editContainer.className = 'inline-edit-container';
            editContainer.style.width = '100%';
            editContainer.style.minWidth = '320px';
            editContainer.style.display = 'flex';
            editContainer.style.flexDirection = 'column';
            
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.width = '100%';
            textarea.style.minHeight = '60px';
            textarea.style.padding = '14px 22px';
            textarea.style.borderRadius = '24px';
            textarea.style.border = '1px solid #60a5fa'; // Light blue border
            textarea.style.outline = 'none';
            textarea.style.fontFamily = 'inherit';
            textarea.style.fontSize = '16px';
            textarea.style.lineHeight = '1.5';
            textarea.style.resize = 'none';
            textarea.style.overflow = 'hidden';
            textarea.style.backgroundColor = 'var(--bg-input)';
            textarea.style.color = 'var(--text-primary)';
            textarea.style.marginBottom = '10px';
            textarea.style.boxSizing = 'border-box';
            
            // Thêm hiệu ứng focus
            textarea.onfocus = () => textarea.style.boxShadow = '0 0 0 2px rgba(96, 165, 250, 0.2)';
            textarea.onblur = () => textarea.style.boxShadow = 'none';
            
            const adjustHeight = () => {
                textarea.style.height = 'auto';
                textarea.style.height = (textarea.scrollHeight) + 'px';
            };
            
            const buttonRow = document.createElement('div');
            buttonRow.style.display = 'flex';
            buttonRow.style.justifyContent = 'flex-end';
            buttonRow.style.gap = '8px';
            
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Huỷ';
            cancelBtn.style.background = 'transparent';
            cancelBtn.style.border = 'none';
            cancelBtn.style.cursor = 'pointer';
            cancelBtn.style.fontSize = '14px';
            cancelBtn.style.fontWeight = '500';
            cancelBtn.style.color = 'var(--text-primary)';
            cancelBtn.style.padding = '8px 16px';
            cancelBtn.style.borderRadius = '999px';
            cancelBtn.onmouseover = () => cancelBtn.style.background = 'rgba(0,0,0,0.05)';
            cancelBtn.onmouseout = () => cancelBtn.style.background = 'transparent';
            
            const saveBtn = document.createElement('button');
            saveBtn.textContent = 'Cập nhật';
            saveBtn.style.border = 'none';
            saveBtn.style.borderRadius = '999px';
            saveBtn.style.padding = '8px 16px';
            saveBtn.style.fontSize = '14px';
            saveBtn.style.fontWeight = '500';
            saveBtn.style.transition = 'all 0.2s';
            
            const updateSaveBtnState = () => {
                if (textarea.value.trim() === '' || textarea.value === text) {
                    saveBtn.style.background = 'rgba(0, 0, 0, 0.1)';
                    saveBtn.style.color = 'rgba(0, 0, 0, 0.4)';
                    saveBtn.style.cursor = 'not-allowed';
                    saveBtn.disabled = true;
                } else {
                    saveBtn.style.background = '#1a73e8';
                    saveBtn.style.color = '#fff';
                    saveBtn.style.cursor = 'pointer';
                    saveBtn.disabled = false;
                }
            };
            
            textarea.addEventListener('input', () => {
                adjustHeight();
                updateSaveBtnState();
            });
            
            cancelBtn.onclick = () => {
                editContainer.remove();
                contentDiv.style.display = 'block';
                actionBar.style.display = 'flex';
            };
            
            saveBtn.onclick = () => {
                const newText = textarea.value.trim();
                if (!newText || newText === text) return;
                
                const messageInput = document.getElementById("message");
                if (messageInput) {
                    messageInput.value = newText;
                    editContainer.remove();
                    contentDiv.style.display = 'block';
                    actionBar.style.display = 'flex';
                    // Gọi hàm gửi tin nhắn ngay lập tức
                    sendMessage();
                }
            };
            
            buttonRow.appendChild(cancelBtn);
            buttonRow.appendChild(saveBtn);
            editContainer.appendChild(textarea);
            editContainer.appendChild(buttonRow);
            
            wrapper.insertBefore(editContainer, actionBar);
            
            setTimeout(() => {
                adjustHeight();
                updateSaveBtnState();
                textarea.focus();
                textarea.setSelectionRange(textarea.value.length, textarea.value.length);
            }, 0);
        };
    } else if (editBtn) {
        editBtn.style.display = 'none';
    }

    // Hiệu ứng hover hiện công cụ
    div.addEventListener('mouseenter', () => {
        div.querySelector('.user-action-bar').style.opacity = '1';
    });
    div.addEventListener('mouseleave', () => {
        div.querySelector('.user-action-bar').style.opacity = '0';
    });
    // Hiển thị luôn trên mobile
    if (window.innerWidth <= 768) {
        div.querySelector('.user-action-bar').style.opacity = '1';
    }

    chatContainer.appendChild(div);
}

function appendAILoading(id) {
    const div = document.createElement('div');
    div.className = 'chat-bubble ai-bubble';
    div.id = id;
    div.innerHTML = `
        <div class="ai-avatar">✨</div>
        <div class="bubble-content">
            <div class="status-box status-loading">Docbot đang suy nghĩ...</div>
        </div>
    `;
    chatContainer.appendChild(div);
}

function appendAIMessage(htmlContent, animate = true) {
    const div = document.createElement('div');
    div.className = 'chat-bubble ai-bubble' + (animate ? '' : ' no-animation');
    div.innerHTML = `
        <div class="ai-avatar">✨</div>
        <div class="bubble-content">${htmlContent}</div>
    `;
    chatContainer.appendChild(div);
}

function removeElement(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function scrollToBottom() {
    const wrapper = document.getElementById('chatWrapper');
    wrapper.scrollTop = wrapper.scrollHeight;
}

// HÃ m chá»‘ng XSS khi render text cá»§a ngÆ°á» i dÃ¹ng
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag]));
}

async function fetchDocumentSearch(message) {
    // Bá»  qua náº¿u tin nháº¯n rá»—ng
    if (!message || message.trim() === "") {
        return { success: true, question: message, files: [] };
    }

    // YÊU CẦU MỚI: Chỉ tìm tài liệu khi người dùng gõ rõ chữ "tìm tài liệu"
    const lowerMsg = message.toLowerCase();
    if (!lowerMsg.includes("tÃ¬m tÃ i liá»‡u") && !lowerMsg.includes("tìm tài liệu") && !lowerMsg.includes("tim tai lieu")) {
        return { success: true, question: message, files: [] };
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000); // Tối đa 45s cho tìm kiếm tài liệu

        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        const workerData = await response.json();

        if (workerData.success && workerData.files && workerData.files.length > 0) {
            const files = workerData.files;
            
            // Thuáº­t toÃ¡n bÃ³c tÃ¡ch tá»« khÃ³a báº±ng Javascript (Tá»‘c Ä‘á»™: 1ms, khÃ´ng tá»‘n API)
            let keyword = message.toLowerCase().trim();
            
            // 1. Xóa các cụm từ mào đầu
            const prefixes = ["làm ơn", "bạn ơi", "cho mình xin", "cho tôi xin", "tìm giúp", "tìm kiếm", "tìm", "xin", "có", "bạn có", "hãy tìm"];
            for (let p of prefixes) {
                if (keyword.startsWith(p)) {
                    keyword = keyword.substring(p.length).trim();
                }
            }
            
            // 2. Xóa các cụm từ đuôi
            const suffixes = ["không", "nhé", "nha", "với", "đi", "giúp mình", "giúp tôi", "ạ", "không vậy", "không ạ"];
            for (let s of suffixes) {
                if (keyword.endsWith(s)) {
                    keyword = keyword.substring(0, keyword.length - s.length).trim();
                }
            }
            
            // 3. Xóa các từ chung chung chỉ loại file
            keyword = keyword.replace(/tài liệu|file|bài tập|đề thi|tóm tắt|lý thuyết|chuyên đề|thư mục|folder|sách|đáp án|hướng dẫn|ôn tập|ôn thi|đề cương|kiểm tra|môn|về|của|cho|các|lớp|khối|bài|chương|phần/gi, "").trim();

            if (!keyword) {
                return { success: true, question: message, files: [] };
            }

            // Hàm chuẩn hóa chuỗi tuyệt đối
            const normalize = (str) => {
                if (!str) return "";
                return str.normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "") // Xóa dấu tiếng Việt
                          .replace(/đ/g, "d").replace(/Đ/g, "D") // Sửa lỗi chữ đ
                          .toLowerCase()
                          .replace(/[^a-z0-9]/g, ""); // Xóa toàn bộ kí tự đặc biệt, dấu cách, giữ chữ & số
            };
            
            // Hàm chuẩn hóa thành mảng từ (chữ và số)
            const normalizeWords = (str) => {
                if (!str) return [];
                return str.normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "") 
                          .replace(/đ/g, "d").replace(/Đ/g, "D") 
                          .toLowerCase()
                          .replace(/[^a-z0-9]/g, " ") // Biến mọi ký tự đặc biệt thành dấu cách
                          .split(/\s+/) // Cắt theo dấu cách
                          .filter(w => w.length > 0);
            };

            const searchKey = normalize(keyword);
            const queryWords = normalizeWords(keyword);
            
            if (searchKey.length < 3) {
                 return { success: false, error: `Từ khóa quá ngắn để tìm kiếm tài liệu.`, skipErrorUI: true };
            }

            // Hàm lấy tên đầy đủ bao gồm thư mục cha
            const parentMap = workerData.parentMap || {};
            const getFullPathName = (file) => {
                let name = file.name;
                let currentId = parentMap[file.id];
                let depth = 0;
                while (currentId && depth < 3) {
                    const parentFile = files.find(f => f.id === currentId);
                    if (parentFile) {
                        name = parentFile.name + " " + name;
                        currentId = parentMap[currentId];
                    } else {
                        break;
                    }
                    depth++;
                }
                return name;
            };

            let finalFiles = files.filter(f => {
                const fullName = getFullPathName(f);
                const fName = normalize(fullName);
                const fWords = normalizeWords(fullName);
                
                if (fName.includes(searchKey)) return true;
                if (queryWords.length > 0 && queryWords.every(w => fWords.includes(w))) return true;
                if (fWords.length > 0 && fWords.every(w => queryWords.includes(w))) return true;
                
                return false;
            });

            // Nếu tìm thấy thư mục, chỉ trả về thư mục (bỏ qua các file lẻ để đỡ rối mắt)
            const hasFolder = finalFiles.some(f => f.type === 'folder');
            if (hasFolder) {
                finalFiles = finalFiles.filter(f => f.type === 'folder');
            }
            
            if (finalFiles.length === 0) {
                const sampleFiles = files.slice(0, 5).map(f => f.name).join(", ");
                return { success: false, error: `Hệ thống không tìm thấy tài liệu nào có tên chứa từ khóa: "${keyword}" (chuẩn hóa: ${searchKey}). Đã quét tổng cộng ${files.length} tài liệu từ Google Drive của bạn. Các file hệ thống quét được ví dụ như: [${sampleFiles}]. Vui lòng kiểm tra xem bạn đã copy đúng FOLDER_IDS trên Cloudflare chưa!` };
            }

            // Ưu tiên hiển thị file trước để Gemini có thể đọc nội dung, thư mục để sau
            finalFiles.sort((a, b) => {
                if (a.type === 'file' && b.type === 'folder') return -1;
                if (a.type === 'folder' && b.type === 'file') return 1;
                return 0;
            });

            return {
                success: true,
                question: message,
                files: finalFiles
            };
        }
        
        return workerData;
    } catch (err) {
        if (err.name === 'AbortError') {
            console.log("TÃ¬m kiáº¿m tÃ i liá»‡u quÃ¡ lÃ¢u (>4s), chuyá»ƒn tháº³ng cho Gemini xá»­ lÃ½.");
            return { success: true, question: message, files: [] };
        }
        return { success: false, error: err.message };
    }
}

// Gá» i API cá»§a Google Gemini
async function fetchGeminiResponse(message, documentText, files, previousMessages, onUpdate = null) {
    const selectedModel = document.getElementById('modelSelect').value || "gemini-flash-latest";

    const systemPrompt = `Bạn là DocBot, một trợ lý AI chuyên hỗ trợ học tập và tìm kiếm tài liệu.\nNguyên tắc trả lời:\n1. Nếu người dùng chỉ nhập 1-2 từ (ví dụ: "Toán", "Vật lý") mà chưa rõ ý định, hãy trả lời thân thiện.\n2. NẾU BẠN VỪA TÌM THẤY TÀI LIỆU: TỰ ĐỘNG đọc nội dung tài liệu đính kèm và TÓM TẮT BỐ CỤC (Ví dụ: Tài liệu gồm 3 phần. Phần 1: nội dung... Phần 2: nội dung...). Đặc biệt với các đề thi (Văn, Toán...), hãy chỉ rõ từng phần (Đọc hiểu, Nghị luận xã hội, Nghị luận văn học...) và giải thích tóm tắt nội dung/chủ đề của phần đó.\n3. Nếu hỏi bài tập, hãy ĐỌC kĩ tài liệu đính kèm để giải đáp chi tiết.\n4. TUYỆT ĐỐI KHÔNG bọc toàn bộ lời giải trong code block (không dùng \`\`\` hay \`\`\`markdown). Văn bản và công thức toán học ($ hoặc $$) phải để ở dạng text thường để hệ thống render.`;

    const requestBody = {
        systemInstruction: {
            parts: [{ text: systemPrompt }]
        },
        contents: [],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
        }
    };

    // Đưa lịch sử chat vào contents (để lấy ngữ cảnh)
    if (previousMessages && previousMessages.length > 0) {
        // Chỉ lấy tối đa 10 tin nhắn gần nhất để tránh quá tải token
        const recentMessages = previousMessages.slice(-10);
        for (const msg of recentMessages) {
            let rawContent = msg.content;
            if (msg.role === 'ai') {
                // Xóa html phụ trợ để Gemini tập trung nội dung chính
                rawContent = rawContent.replace(/<div class="status-box[^>]*>.*?<\/div>/gs, '');
                rawContent = rawContent.replace(/<div class="worker-results[^>]*>.*?<\/div>/gs, '');
                rawContent = rawContent.replace(/<[^>]*>?/gm, ''); 
            }
            const parts = [];
            if (msg.image) {
                const match = msg.image.match(/^data:(image\/[a-zA-Z]*);base64,(.*)$/);
                if (match) {
                    parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
                }
            }
            parts.push({ text: rawContent || " " });
            requestBody.contents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: parts
            });
        }
    }

    let currentText = `Câu hỏi của người dùng: "${message}"\n`;

    const hasInlineData = files && files.some(f => f.inlineData);
    if ((documentText && documentText.trim() !== "") || hasInlineData || (files && files.length > 0)) {
        currentText += `\nDưới đây là danh sách các tài liệu/thư mục hệ thống vừa tìm được trong Google Drive:\n`;
        if (files && files.length > 0) {
            files.forEach(f => {
                currentText += `- [${f.type === 'folder' ? 'Thư mục' : 'File'}] ${f.name}\n`;
            });
        }
        if (documentText && documentText.trim() !== "") {
            currentText += `\nNội dung chi tiết tài liệu:\n${documentText}\n`;
        }
        currentText += `\n(Hết phần thông tin. Hãy dựa vào các file/thư mục này để trả lời hoặc hướng dẫn người dùng).`;
    }

    const currentParts = [{ text: currentText }];

    if (files) {
        for (const f of files) {
            if (f.inlineData) {
                currentParts.push({ inlineData: f.inlineData });
            }
        }
    }

    requestBody.contents.push({
        role: 'user',
        parts: currentParts
    });

    let attempts = 0;
    while (attempts < GEMINI_API_KEYS.length) {
        const currentKey = GEMINI_API_KEYS[currentApiKeyIndex];
        const endpoint = onUpdate ? 'streamGenerateContent?alt=sse&' : 'generateContent?';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:${endpoint}key=${currentKey}`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                let errorMsg = `Lỗi kết nối API (HTTP ${response.status})`;
                try {
                    const data = await response.json();
                    if (data.error && data.error.message) {
                        errorMsg = data.error.message;
                        if (errorMsg.includes("Quota exceeded") || errorMsg.includes("429") || errorMsg.toLowerCase().includes("quota")) {
                            console.warn(`Key API ở vị trí ${currentApiKeyIndex} đã hết lượt. Chuyển sang key tiếp theo...`);
                            currentApiKeyIndex = (currentApiKeyIndex + 1) % GEMINI_API_KEYS.length;
                            attempts++;
                            if (attempts >= GEMINI_API_KEYS.length) {
                                throw new Error(`Tất cả ${GEMINI_API_KEYS.length} API Key của bạn đều đã vượt quá giới hạn lượt hỏi. Vui lòng đợi khoảng 1 phút rồi thử lại nhé!`);
                            }
                            continue;
                        }
                    } else if (data.error) {
                        errorMsg = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
                    }
                } catch(e) { }
                throw new Error(errorMsg);
            }

            if (!onUpdate) {
                const data = await response.json();
                if (data.candidates && data.candidates.length > 0) {
                    return data.candidates[0].content.parts[0].text;
                }
                return "Không nhận được phản hồi phù hợp.";
            }

            let reader;
            try {
                reader = response.body.getReader();
            } catch (readerError) {
                console.warn("Lỗi getReader (có thể do tiện ích mở rộng/diệt virus khóa luồng):", readerError);
                try {
                    const fallbackText = await response.text();
                    let parsedText = "";
                    const lines = fallbackText.split('\n');
                    for (let line of lines) {
                        if (line.startsWith('data: ')) {
                            const dataStr = line.slice(6).trim();
                            if (dataStr === '[DONE]') continue;
                            try {
                                const data = JSON.parse(dataStr);
                                if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts) {
                                    parsedText += data.candidates[0].content.parts[0].text;
                                }
                            } catch (e) {}
                        }
                    }
                    if (onUpdate) onUpdate(parsedText);
                    return parsedText;
                } catch (fallbackError) {
                    throw new Error("Trình duyệt không cho phép đọc luồng dữ liệu (Stream Locked). Vui lòng thử dùng Tab Ẩn danh (Incognito) hoặc tạm tắt các tiện ích chặn quảng cáo/diệt virus rồi thử lại.");
                }
            }

            const decoder = new TextDecoder("utf-8");
            let fullText = "";
            let buffer = "";
            let lastUpdate = 0;

            while (true) {
                const { value, done } = await reader.read();
                
                if (value) {
                    buffer += decoder.decode(value, { stream: !done });
                    let lines = buffer.split('\n');
                    buffer = lines.pop(); 
                    
                    for (let line of lines) {
                        if (line.startsWith('data: ')) {
                            const dataStr = line.slice(6).trim();
                            if (dataStr === '[DONE]') continue;
                            try {
                                const data = JSON.parse(dataStr);
                                if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts) {
                                    fullText += data.candidates[0].content.parts[0].text;
                                    const now = Date.now();
                                    if (now - lastUpdate > 50) {
                                        onUpdate(fullText);
                                        lastUpdate = now;
                                    }
                                }
                            } catch (e) {}
                        }
                    }
                }

                if (done) {
                    if (buffer.startsWith('data: ')) {
                        const dataStr = buffer.slice(6).trim();
                        if (dataStr !== '[DONE]') {
                            try {
                                const data = JSON.parse(dataStr);
                                if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts) {
                                    fullText += data.candidates[0].content.parts[0].text;
                                }
                            } catch (e) {}
                        }
                    }
                    onUpdate(fullText); // Gọi callback lần cuối khi hoàn thành để render nội dung cuối cùng
                    break;
                }
            }
            return fullText;
            
        } catch (e) {
            // Lá»—i máº¡ng hoáº·c lá»—i tá»± nÃ©m (nhÆ° háº¿t key)
            if (e.message.includes("Tất cả") || !e.message.includes("Failed to fetch")) {
                throw e; 
            }
            console.error("Lỗi kết nối khi gọi Gemini:", e);
            throw e;
        }
    }
}

// ==========================================
// Xá»¬ LÃ  CÃ€I Ä áº¶T (SETTINGS)
// ==========================================
const userProfile = document.getElementById('userProfile');
const accountModal = document.getElementById('accountModal');
const closeAccountBtn = document.getElementById('closeAccountBtn');

const settingsBtn = document.getElementById('settingsBtn');
const settingsDropdown = document.getElementById('settingsDropdown');
const logoutBtn = document.getElementById('logoutBtn');

// Ä á» c cÃ i Ä‘áº·t
function loadSettings() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedGradient = localStorage.getItem('gradient') || 'default';
    
    applyTheme(savedTheme);
    applyGradient(savedGradient);
    
    updateCheckIcons('themeSubMenu', savedTheme);
    updateCheckIcons('gradientSubMenu', savedGradient);
}

function updateCheckIcons(parentId, value) {
    const parent = document.getElementById(parentId);
    if (!parent) return;
    const items = parent.querySelectorAll('li');
    items.forEach(item => {
        if (item.dataset.themeVal === value || item.dataset.gradVal === value) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else if (theme === 'system') {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
}

function applyGradient(gradient) {
    document.body.className = '';
    if (gradient && gradient !== 'default') {
        document.body.classList.add(`grad-${gradient}`);
    }
}

// Má»Ÿ/Ä Ã³ng Account Modal
if (userProfile && accountModal) {
    userProfile.addEventListener('click', (e) => {
        // Chá»‰ má»Ÿ khi click vÃ o userProfile, khÃ´ng pháº£i cÃ¡c icon bÃªn trong
        if (e.target.closest('#settingsBtn') || e.target.closest('#logoutBtn')) return;
        
        accountModal.classList.add('active');
        if (settingsDropdown) settingsDropdown.classList.remove('active');
    });
}
if (closeAccountBtn) {
    closeAccountBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        accountModal.classList.remove('active');
    });
}

// Má»Ÿ/Ä Ã³ng Settings Dropdown
if (settingsBtn && settingsDropdown) {
    settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // KhÃ´ng cho lan ra userProfile
        settingsDropdown.classList.toggle('active');
        if (accountModal) accountModal.classList.remove('active');
        
        // Ä Ã³ng cÃ¡c submenu Ä‘ang má»Ÿ
        document.querySelectorAll('.has-submenu').forEach(el => el.classList.remove('active'));
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (supabaseClient) {
            await supabaseClient.auth.signOut();
        }
    });
}

const manageAccountBtn = document.getElementById('manageAccountBtn');
if (manageAccountBtn) {
    manageAccountBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        window.open('https://myaccount.google.com/', '_blank');
    });
}

const logoutAllBtn = document.getElementById('logoutAllBtn');
if (logoutAllBtn) {
    logoutAllBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (supabaseClient) {
            await supabaseClient.auth.signOut();
        }
    });
}

const addAccountBtn = document.getElementById('addAccountBtn');
if (addAccountBtn) {
    addAccountBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (supabaseClient) {
            // Chuyá»ƒn hÆ°á»›ng Ä‘Äƒng nháº­p Google láº¡i
            await supabaseClient.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    queryParams: {
                        prompt: 'select_account'
                    }
                }
            });
        }
    });
}

// Chuyá»ƒn tÃ i khoáº£n (chá» n tá»« danh sÃ¡ch)
document.querySelectorAll('.account-list-item').forEach(item => {
    item.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (supabaseClient) {
            await supabaseClient.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    queryParams: {
                        prompt: 'select_account'
                    }
                }
            });
        }
    });
});

// áº¨n/hiá»‡n danh sÃ¡ch tÃ i khoáº£n
const toggleAccountsBtn = document.getElementById('toggleAccountsBtn');
const accountListSection = document.getElementById('accountListSection');
if (toggleAccountsBtn && accountListSection) {
    toggleAccountsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        accountListSection.classList.toggle('collapsed');
        const textSpan = document.getElementById('toggleAccountsText');
        if (accountListSection.classList.contains('collapsed')) {
            textSpan.textContent = 'Hiá»‡n thÃªm tÃ i khoáº£n';
        } else {
            textSpan.textContent = 'áº¨n bá»›t tÃ i khoáº£n';
        }
    });
}

// Má»Ÿ/Ä Ã³ng Sub-menu
document.querySelectorAll('.has-submenu').forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Ä Ã³ng cÃ¡c submenu khÃ¡c
        document.querySelectorAll('.has-submenu').forEach(el => {
            if (el !== item) el.classList.remove('active');
        });
        
        item.classList.toggle('active');
    });
});

// Chá» n Theme
const themeItems = document.querySelectorAll('#themeSubMenu li');
themeItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        const theme = item.dataset.themeVal;
        localStorage.setItem('theme', theme);
        applyTheme(theme);
        updateCheckIcons('themeSubMenu', theme);
        settingsDropdown.classList.remove('active');
    });
});

// Chá» n Gradient
const gradientItems = document.querySelectorAll('#gradientSubMenu li');
gradientItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.stopPropagation();
        const gradient = item.dataset.gradVal;
        localStorage.setItem('gradient', gradient);
        applyGradient(gradient);
        updateCheckIcons('gradientSubMenu', gradient);
        settingsDropdown.classList.remove('active');
    });
});

// Ä Ã³ng khi click ngoÃ i
window.addEventListener('click', (e) => {
    if (accountModal && !accountModal.contains(e.target) && !userProfile.contains(e.target)) {
        accountModal.classList.remove('active');
    }
    if (settingsDropdown && !settingsDropdown.contains(e.target) && !settingsBtn.contains(e.target)) {
        settingsDropdown.classList.remove('active');
    }
    if (chatOptionsMenu && chatOptionsMenu.classList.contains('active') && !chatOptionsMenu.contains(e.target) && !e.target.closest('.chat-options-btn')) {
        chatOptionsMenu.classList.remove('active');
    }
});

// Láº¯ng nghe thay Ä‘á»•i há»‡ thá»‘ng náº¿u Ä‘ang á»Ÿ cháº¿ Ä‘á»™ system
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (localStorage.getItem('theme') === 'system') {
        applyTheme('system');
    }
});

// Sidebar Toggle
const menuBtn = document.querySelector('.menu-btn');
const sidebar = document.querySelector('.sidebar');

if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        // LÆ°u tráº¡ng thÃ¡i sidebar
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    });

    // KhÃ´i phá»¥c tráº¡ng thÃ¡i sidebar
    if (localStorage.getItem('sidebarCollapsed') === 'true') {
        sidebar.classList.add('collapsed');
    }
}

// Mobile Sidebar Logic
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebarOverlay = document.getElementById('sidebarOverlay');

if (mobileMenuBtn && sidebar && sidebarOverlay) {
    mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('mobile-open');
        sidebarOverlay.classList.toggle('active');
    });
    
    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('mobile-open');
        sidebarOverlay.classList.remove('active');
    });
    
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', () => {
            sidebar.classList.remove('mobile-open');
            sidebarOverlay.classList.remove('active');
        });
    }
}

// Khá»Ÿi cháº¡y
loadSettings();

// Chat Options Menu Logic
let currentMenuChatId = null;
let currentMenuChatTitle = "";
const chatOptionsMenu = document.getElementById('chatOptionsMenu');

function openChatMenu(e, chatId, chatTitle, btnElement) {
    if (!chatOptionsMenu) return;
    
    currentMenuChatId = chatId;
    currentMenuChatTitle = chatTitle;

    // Check if chat is pinned
    const userIdKey = currentUser ? currentUser.id : 'local';
    const pinnedChats = JSON.parse(localStorage.getItem('pinnedChats_' + userIdKey) || "[]");
    const isPinned = pinnedChats.includes(chatId);
    
    // Update Pin option text and icon
    const optPin = document.getElementById('optPin');
    if (optPin) {
        if (isPinned) {
            optPin.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>
            <span style="color: #f59e0b;">Bỏ ghim</span>`;
        } else {
            optPin.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
            <span style="color: #f59e0b;">Ghim</span>`;
        }
    }
    
    // Reset position to allow calculation
    chatOptionsMenu.style.display = 'block';
    
    // Position menu near the button
    const rect = btnElement.getBoundingClientRect();
    
    let leftPos = rect.left + window.scrollX;
    const menuWidth = chatOptionsMenu.offsetWidth || 200;
    const menuHeight = chatOptionsMenu.offsetHeight || 250;
    
    // Prevent menu from overflowing the right edge of the screen
    if (leftPos + menuWidth > window.innerWidth) {
        leftPos = window.innerWidth - menuWidth - 10;
    }
    
    let topPos = rect.bottom + window.scrollY;
    
    // Nếu menu bị che khuất ở dưới cùng, đẩy nó lộn ngược lên trên
    if (rect.bottom + menuHeight > window.innerHeight) {
        topPos = rect.top + window.scrollY - menuHeight - 5;
    }
    
    chatOptionsMenu.style.top = `${topPos}px`;
    chatOptionsMenu.style.left = `${leftPos}px`;
    
    chatOptionsMenu.classList.add('active');
    chatOptionsMenu.style.display = ''; // Let css class handle it
}

async function renameChat(chatId, newTitle) {
    if (chatId.toString().startsWith('local_')) {
        let localChats = JSON.parse(localStorage.getItem('localChats') || '[]');
        let chat = localChats.find(c => c.id === chatId);
        if (chat) {
            chat.title = newTitle;
            localStorage.setItem('localChats', JSON.stringify(localChats));
            loadChatHistory(currentUser ? currentUser.id : null);
        }
        return;
    }

    if (!supabaseClient) return;
    
    const { error } = await supabaseClient
        .from('chats')
        .update({ title: newTitle })
        .eq('id', chatId);
        
    if (error) {
        console.error("Lá»—i khi Ä‘á»•i tÃªn chat:", error);
        alert("CÃ³ lá»—i xáº£y ra khi Ä‘á»•i tÃªn.");
        return;
    }
    
    if (currentUser) {
        loadChatHistory(currentUser.id);
    }
}

async function deleteChat(chatId) {
    if (chatId.toString().startsWith('local_')) {
        let localChats = JSON.parse(localStorage.getItem('localChats') || '[]');
        localChats = localChats.filter(c => c.id !== chatId);
        localStorage.setItem('localChats', JSON.stringify(localChats));
        
        if (currentChatId === chatId) {
            currentChatId = null;
            chatContainer.innerHTML = '<div class="empty-chat-message" style="display:flex; height:100%; align-items:center; justify-content:center; color:var(--text-secondary);">Chọn một cuộc trò chuyện hoặc tạo mới</div>';
        }
        
        loadChatHistory(currentUser ? currentUser.id : null);
        return;
    }

    if (!supabaseClient) return;
    
    const { error } = await supabaseClient
        .from('chats')
        .delete()
        .eq('id', chatId);
        
    if (error) {
        console.error("Lá»—i khi xÃ³a chat:", error);
        alert("CÃ³ lá»—i xáº£y ra khi xÃ³a cuá»™c trÃ² chuyá»‡n.");
        return;
    }
    
    if (currentChatId === chatId) {
        currentChatId = null;
        chatContainer.innerHTML = '<div class="empty-chat-message" style="display:flex; height:100%; align-items:center; justify-content:center; color:var(--text-secondary);">Chọn một cuộc trò chuyện hoặc tạo mới</div>';
    }
    
    if (currentUser) {
        loadChatHistory(currentUser.id);
    }
}

const optRename = document.getElementById('optRename');
const renameModalOverlay = document.getElementById('renameModalOverlay');
const renameInput = document.getElementById('renameInput');
const cancelRenameBtn = document.getElementById('cancelRenameBtn');
const confirmRenameBtn = document.getElementById('confirmRenameBtn');

if (optRename && renameModalOverlay) {
    optRename.addEventListener('click', () => {
        if (!currentMenuChatId) return;
        chatOptionsMenu.classList.remove('active');
        
        renameInput.value = currentMenuChatTitle;
        renameModalOverlay.classList.add('active');
        renameInput.focus();
    });
    
    cancelRenameBtn.addEventListener('click', () => {
        renameModalOverlay.classList.remove('active');
    });
    
    confirmRenameBtn.addEventListener('click', async () => {
        const newTitle = renameInput.value.trim();
        if (newTitle && currentMenuChatId) {
            renameModalOverlay.classList.remove('active');
            await renameChat(currentMenuChatId, newTitle);
        }
    });
}

const optDelete = document.getElementById('optDelete');
const deleteModalOverlay = document.getElementById('deleteModalOverlay');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

if (optDelete && deleteModalOverlay) {
    optDelete.addEventListener('click', () => {
        if (!currentMenuChatId) return;
        chatOptionsMenu.classList.remove('active');
        deleteModalOverlay.classList.add('active');
    });
    
    cancelDeleteBtn.addEventListener('click', () => {
        deleteModalOverlay.classList.remove('active');
    });
    
    confirmDeleteBtn.addEventListener('click', async () => {
        if (currentMenuChatId) {
            deleteModalOverlay.classList.remove('active');
            await deleteChat(currentMenuChatId);
        }
    });
}

const optDeleteAll = document.getElementById('optDeleteAll');
if (optDeleteAll) {
    optDeleteAll.addEventListener('click', async () => {
        chatOptionsMenu.classList.remove('active');
        if (confirm("Bạn có chắc chắn muốn xóa TẤT CẢ cuộc trò chuyện không? Thao tác này không thể khôi phục.")) {
            if (!currentUser) {
                localStorage.removeItem('localChats');
            } else {
                if (!supabaseClient) return;
                const { error } = await supabaseClient
                    .from('chats')
                    .delete()
                    .eq('user_id', currentUser.id);
                    
                if (error) {
                    console.error("Lỗi khi xóa tất cả chat:", error);
                    alert("Có lỗi xảy ra khi xóa tất cả cuộc trò chuyện.");
                    return;
                }
            }
            
            currentChatId = null;
            chatContainer.innerHTML = `
                <div class="welcome-screen" id="welcomeScreen">
                    <h1 class="greeting">Chúng ta nên bắt đầu từ đâu nhỉ?</h1>
                </div>
            `;
            welcomeScreen = document.getElementById("welcomeScreen");
            loadChatHistory(currentUser ? currentUser.id : null);
        }
    });
}

const optPin = document.getElementById('optPin');
if (optPin) {
    optPin.addEventListener('click', () => {
        if (!currentMenuChatId) return;
        chatOptionsMenu.classList.remove('active');
        
        const userIdKey = currentUser ? currentUser.id : 'local';
        let pinnedChats = JSON.parse(localStorage.getItem('pinnedChats_' + userIdKey) || "[]");
        if (pinnedChats.includes(currentMenuChatId)) {
            pinnedChats = pinnedChats.filter(id => id !== currentMenuChatId);
        } else {
            pinnedChats.push(currentMenuChatId);
        }
        localStorage.setItem('pinnedChats_' + userIdKey, JSON.stringify(pinnedChats));
        
        loadChatHistory(currentUser ? currentUser.id : null);
    });
}

// Logic tÃ¬m kiáº¿m cuá»™c trÃ² chuyá»‡n
const chatSearchInput = document.getElementById('chatSearchInput');
if (chatSearchInput) {
    chatSearchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        const recentList = document.querySelector('.recent-list');
        if (recentList) {
            const items = recentList.querySelectorAll('.recent-item');
            items.forEach(item => {
                const titleSpan = item.querySelector('.chat-title-group span');
                if (titleSpan) {
                    const title = titleSpan.textContent.toLowerCase();
                    if (title.includes(searchTerm)) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                }
            });
        }
    });
}

// ==========================================
// Tá»I Æ¯U HÃ“A RESPONSIVE MOBILE (100dvh fix)
// ==========================================
function setAppHeight() {
    const doc = document.documentElement;
    doc.style.setProperty('--app-height', `${window.innerHeight}px`);
}
window.addEventListener('resize', setAppHeight);
setAppHeight();
// Hu?ng d?n s? d?ng logic
const guideBtn = document.getElementById('guideBtn');
const guideModalOverlay = document.getElementById('guideModalOverlay');
const guideCloseBtn = document.getElementById('guideCloseBtn');

function openGuide() {
    if(guideModalOverlay) guideModalOverlay.classList.add('show');
}

function closeGuide() {
    if(guideModalOverlay) guideModalOverlay.classList.remove('show');
}

if (guideBtn) guideBtn.addEventListener('click', openGuide);
if (guideCloseBtn) guideCloseBtn.addEventListener('click', closeGuide);
if (guideModalOverlay) {
    guideModalOverlay.addEventListener('click', (e) => {
        if (e.target === guideModalOverlay) closeGuide();
    });
}

// T? d?ng m? l?n d?u tiên
if (!localStorage.getItem('hasSeenGuide')) {
    setTimeout(openGuide, 1000); // M? sau 1 giây khi m?i t?i trang
    localStorage.setItem('hasSeenGuide', 'true');
}

