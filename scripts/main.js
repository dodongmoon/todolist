// ==================== 
// 상수 및 전역 변수
// ==================== 
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const API_KEY_STORAGE_KEY = 'gemini_api_key';

// 🔑 여기에 본인의 Gemini API 키를 입력하세요!
const DEFAULT_API_KEY = 'AIzaSyAi3DAVM8Cu_AIdvUmPfjDDPpanLvTj7Fo'; // 예: 'AIzaSyABC123...'

let todos = [];
let selectedTodo = null;
let aiResults = [];
let geminiApiKey = DEFAULT_API_KEY; // 기본 API 키로 초기화

// ==================== 
// DOM 요소 참조
// ==================== 
const todoInput = document.getElementById('todoInput');
const addTodoBtn = document.getElementById('addTodoBtn');
const todoList = document.getElementById('todoList');
const randomSelectBtn = document.getElementById('randomSelectBtn');
const resultSection = document.getElementById('resultSection');
const resultCards = document.getElementById('resultCards');
const tryAgainBtn = document.getElementById('tryAgainBtn');
const resetBtn = document.getElementById('resetBtn');
const loadingOverlay = document.getElementById('loadingOverlay');



// ==================== 
// 이벤트 리스너 등록
// ==================== 
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // 기본 이벤트 리스너 등록
    addTodoBtn.addEventListener('click', handleAddTodo);
    todoInput.addEventListener('keypress', handleTodoInputKeypress);
    randomSelectBtn.addEventListener('click', handleRandomSelect);
    tryAgainBtn.addEventListener('click', handleTryAgain);
    resetBtn.addEventListener('click', handleReset);
    
    // 전역 키보드 이벤트 리스너
    document.addEventListener('keydown', handleGlobalKeypress);
    
    // 입력 필드 개선
    todoInput.addEventListener('input', handleTodoInputChange);
    todoInput.addEventListener('focus', handleTodoInputFocus);
    todoInput.addEventListener('blur', handleTodoInputBlur);
    
    // 강도 슬라이더 이벤트 리스너
    const intensitySlider = document.getElementById('intensitySlider');
    intensitySlider.addEventListener('input', handleIntensitySliderChange);
    
    // 라벨 클릭 시 슬라이더 값 변경
    const intensityLabels = document.querySelectorAll('.intensity-label-item');
    intensityLabels.forEach(label => {
        label.addEventListener('click', handleIntensityLabelClick);
    });
    
    // API 키 로드
    loadApiKey();
    
    // 초기 상태 설정
    updateUI();
    updateIntensitySliderUI(); // 초기 강도 슬라이더 UI 설정
    todoInput.focus();
    
    // 환영 메시지
    setTimeout(() => {
        showToast('할 일을 입력하고 AI에게 선택을 맡겨보세요! 🎯', 'info', 4000);
    }, 1000);
}

// ==================== 
// 할 일 관리 함수들
// ==================== 
function handleAddTodo() {
    const todoText = todoInput.value.trim();
    
    // 입력 유효성 검사
    if (todoText === '') {
        showToast('할 일을 입력해주세요! ✏️', 'warning');
        todoInput.focus();
        return;
    }
    
    if (todoText.length < 2) {
        showToast('할 일은 최소 2글자 이상 입력해주세요!', 'warning');
        todoInput.focus();
        return;
    }
    
    if (todoText.length > 50) {
        showToast('할 일은 50글자 이내로 입력해주세요!', 'warning');
        todoInput.focus();
        return;
    }
    
    if (todos.includes(todoText)) {
        showToast('이미 추가된 할 일입니다! 🔄', 'warning');
        todoInput.focus();
        return;
    }
    
    if (todos.length >= 5) {
        showToast('할 일은 최대 5개까지만 추가할 수 있어요!', 'warning');
        return;
    }
    
    // 할 일 추가
    todos.push(todoText);
    todoInput.value = '';
    
    // 성공 피드백
    showToast(`"${todoText}" 추가됨! ✅`, 'success');
    
    // UI 업데이트 및 애니메이션
    updateUI();
    todoInput.focus();
    
    // 부드러운 스크롤 효과와 하이라이트
    setTimeout(() => {
        const lastTodoItem = todoList.lastElementChild;
        if (lastTodoItem && lastTodoItem.classList.contains('todo-item')) {
            lastTodoItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            
            // 추가된 항목 하이라이트 효과
            lastTodoItem.style.background = 'rgba(16, 185, 129, 0.2)';
            lastTodoItem.style.transform = 'scale(1.02)';
            
            setTimeout(() => {
                lastTodoItem.style.background = 'var(--bg-secondary)';
                lastTodoItem.style.transform = 'scale(1)';
            }, 1000);
        }
    }, 100);
}

function handleTodoInputKeypress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        handleAddTodo();
    }
    
    // Escape 키로 입력 필드 클리어
    if (event.key === 'Escape') {
        todoInput.value = '';
        todoInput.blur();
    }
}

// 전역 키보드 단축키
function handleGlobalKeypress(event) {
    // Ctrl/Cmd + Enter로 랜덤 선택
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        if (!randomSelectBtn.disabled) {
            handleRandomSelect();
        }
    }
    
    // 입력 필드가 포커스되지 않은 상태에서 텍스트 입력 시 자동 포커스
    if (!todoInput.matches(':focus') && 
        !resultSection.classList.contains('hidden') === false &&
        event.key.length === 1 && 
        !event.ctrlKey && 
        !event.metaKey && 
        !event.altKey) {
        todoInput.focus();
    }
}

function removeTodo(index) {
    if (index < 0 || index >= todos.length) return;
    
    const removedTodo = todos[index];
    todos.splice(index, 1);
    
    // 삭제 피드백
    showToast(`"${removedTodo}" 삭제됨! 🗑️`, 'info');
    
    updateUI();
    
    // 입력창에 포커스
    if (todos.length === 0) {
        todoInput.focus();
    }
}

// 입력 필드 이벤트 핸들러들
function handleTodoInputChange(event) {
    const value = event.target.value;
    const length = value.length;
    
    // 글자 수 제한 안내
    if (length > 40) {
        addTodoBtn.style.background = '#f59e0b';
        addTodoBtn.title = `${length}/50 글자 (거의 다 찼어요!)`;
    } else if (length > 0) {
        addTodoBtn.style.background = 'var(--primary-color)';
        addTodoBtn.title = `${length}/50 글자`;
    } else {
        addTodoBtn.style.background = 'var(--primary-color)';
        addTodoBtn.title = '할 일을 입력하고 추가하세요';
    }
}

function handleTodoInputFocus(event) {
    event.target.style.borderColor = 'var(--primary-color)';
    event.target.style.boxShadow = '0 0 0 3px rgb(99 102 241 / 0.1)';
}

function handleTodoInputBlur(event) {
    event.target.style.borderColor = 'var(--border-color)';
    event.target.style.boxShadow = 'none';
}

// 샘플 할 일 추가 함수
function addSampleTodo(sampleText) {
    // 이미 존재하는지 확인
    if (todos.includes(sampleText)) {
        showToast(`"${sampleText}"는 이미 목록에 있어요! 🤔`, 'warning');
        return;
    }
    
    // 최대 개수 확인
    if (todos.length >= 5) {
        showToast('할 일은 최대 5개까지만 추가할 수 있어요! 📝', 'warning');
        return;
    }
    
    // 할 일 추가
    todos.push(sampleText);
    updateUI();
    showToast(`"${sampleText}"가 추가되었어요! ✨`, 'success');
    
    // 입력 필드에 포커스
    todoInput.focus();
}

// 강도 슬라이더 관련 함수들
function handleIntensitySliderChange() {
    updateIntensitySliderUI();
}

function handleIntensityLabelClick(event) {
    const value = parseInt(event.target.dataset.value);
    const slider = document.getElementById('intensitySlider');
    slider.value = value;
    updateIntensitySliderUI();
}

function updateIntensitySliderUI() {
    const slider = document.getElementById('intensitySlider');
    const sliderValue = parseInt(slider.value);
    
    // 진행바 업데이트
    const progress = document.querySelector('.slider-progress');
    const progressWidth = (sliderValue / 2) * 100; // 0-2 범위를 0-100%로 변환
    progress.style.width = `${progressWidth}%`;
    
    // 상단 라벨 활성화 상태 업데이트
    const labels = document.querySelectorAll('.intensity-label-item');
    labels.forEach(label => {
        const labelValue = parseInt(label.dataset.value);
        if (labelValue === sliderValue) {
            label.classList.add('active');
        } else {
            label.classList.remove('active');
        }
    });
    
    // 하단 설명 활성화 상태 업데이트
    const descriptions = document.querySelectorAll('.intensity-desc-item');
    descriptions.forEach(desc => {
        const descValue = parseInt(desc.dataset.value);
        if (descValue === sliderValue) {
            desc.classList.add('active');
        } else {
            desc.classList.remove('active');
        }
    });
}

function renderTodoList() {
    todoList.innerHTML = '';
    
    if (todos.length === 0) {
        // 빈 상태 플레이스홀더 렌더링
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <div class="empty-state-icon">📝</div>
            <div class="empty-state-title">할 일을 추가해보세요!</div>
            <div class="empty-state-description">
                위의 입력창에 할 일을 입력하고<br>
                AI가 무작위로 선택해서 설득해드릴게요
            </div>
            <div class="empty-state-hint">
                <span>💡</span>
                <span>Enter로 빠르게 추가하세요</span>
            </div>
            <div class="empty-state-samples">
                <span class="sample-item" onclick="addSampleTodo('운동하기')">운동하기</span>
                <span class="sample-item" onclick="addSampleTodo('청소하기')">청소하기</span>
                <span class="sample-item" onclick="addSampleTodo('책 읽기')">책 읽기</span>
                <span class="sample-item" onclick="addSampleTodo('공부하기')">공부하기</span>
                <span class="sample-item" onclick="addSampleTodo('개인 잡무 처리')">개인 잡무 처리</span>
            </div>
        `;
        todoList.appendChild(emptyState);
        return;
    }
    
    todos.forEach((todo, index) => {
        const todoItem = document.createElement('li');
        todoItem.className = 'todo-item';
        todoItem.style.animationDelay = `${index * 0.05}s`;
        todoItem.innerHTML = `
            <span class="todo-number">${index + 1}.</span>
            <span class="todo-text">${escapeHtml(todo)}</span>
            <button class="delete-btn" onclick="removeTodo(${index})" title="이 할 일 삭제 (${todo})">
                ❌
            </button>
        `;
        todoList.appendChild(todoItem);
    });
}

// ==================== 
// 랜덤 선택 및 AI 처리
// ==================== 
function handleRandomSelect() {
    if (todos.length < 2) {
        alert('할 일이 최소 2개 이상 있어야 합니다!');
        return;
    }
    
    // 랜덤 선택 애니메이션 효과
    showRandomAnimation(() => {
        // 실제 랜덤 선택
        const randomIndex = Math.floor(Math.random() * todos.length);
        selectedTodo = {
            index: randomIndex,
            text: todos[randomIndex]
        };
        
        // AI 결과 생성 (현재는 더미 데이터)
        generateAIResults();
    });
}

function showRandomAnimation(callback) {
    randomSelectBtn.disabled = true;
    randomSelectBtn.innerHTML = '🎲 선택 중...';
    
    // 할 일 목록에 애니메이션 효과
    const todoItems = todoList.querySelectorAll('.todo-item');
    let animationCount = 0;
    const maxAnimations = 8;
    
    const animationInterval = setInterval(() => {
        // 모든 아이템 초기화
        todoItems.forEach(item => {
            item.style.transform = 'scale(1)';
            item.style.background = 'var(--bg-secondary)';
        });
        
        // 랜덤 아이템 하이라이트
        const randomIndex = Math.floor(Math.random() * todos.length);
        if (todoItems[randomIndex]) {
            todoItems[randomIndex].style.transform = 'scale(1.05)';
            todoItems[randomIndex].style.background = 'rgba(245, 158, 11, 0.2)';
        }
        
        animationCount++;
        
        if (animationCount >= maxAnimations) {
            clearInterval(animationInterval);
            
            // 모든 아이템 초기화
            todoItems.forEach(item => {
                item.style.transform = 'scale(1)';
                item.style.background = 'var(--bg-secondary)';
            });
            
            randomSelectBtn.innerHTML = '🎲 무작위로 선택하기';
            randomSelectBtn.disabled = false;
            
            callback();
        }
    }, 200);
}

async function generateAIResults() {
    showLoading(true);
    
    try {
        // API 키가 없으면 더미 데이터 사용
        if (!geminiApiKey) {
            await generateDummyResults();
            displayResults();
            showToast('API 키를 설정하면 실제 AI 응답을 받을 수 있어요! 🤖', 'info', 4000);
            return;
        }
        
        // 실제 Gemini API 호출
        aiResults = [];
        
        // 선택된 할 일에 대한 이유 생성
        const selectedPrompt = createPromptForSelected(selectedTodo.text, todos);
        const selectedReason = await callGeminiAPI(selectedPrompt);
        
        aiResults.push({
            todo: selectedTodo.text,
            isSelected: true,
            reason: selectedReason.trim()
        });
        
        // 선택되지 않은 할 일들에 대한 이유 생성
        const notSelectedTodos = todos.filter((_, index) => index !== selectedTodo.index);
        
        for (const todo of notSelectedTodos) {
            try {
                const notSelectedPrompt = createPromptForNotSelected(todo, selectedTodo.text);
                const notSelectedReason = await callGeminiAPI(notSelectedPrompt);
                
                aiResults.push({
                    todo: todo,
                    isSelected: false,
                    reason: notSelectedReason.trim()
                });
            } catch (error) {
                console.error(`"${todo}"에 대한 AI 응답 생성 실패:`, error);
                // 실패한 경우 기본 메시지 사용
                aiResults.push({
                    todo: todo,
                    isSelected: false,
                    reason: `지금은 '${selectedTodo.text}'에 집중하세요! 이건 나중에 해도 괜찮아요 😌`
                });
            }
        }
        
        displayResults();
        
    } catch (error) {
        console.error('AI 결과 생성 중 오류:', error);
        
        // 오류 발생 시 더미 데이터로 폴백
        await generateDummyResults();
        displayResults();
        
        if (error.message.includes('API 키')) {
            showToast('API 키를 확인해주세요. 설정에서 다시 입력해보세요!', 'warning');
        } else {
            showToast('AI 처리 중 오류가 발생했습니다. 기본 응답을 표시합니다.', 'warning');
        }
    } finally {
        showLoading(false);
    }
}

// 프롬프트 생성 함수들
function getSelectedIntensity() {
    const slider = document.getElementById('intensitySlider');
    const sliderValue = parseInt(slider.value);
    
    switch (sliderValue) {
        case 0: return 'gentle';
        case 1: return 'normal';
        case 2: return 'strong';
        default: return 'gentle';
    }
}

function createPromptForSelected(selectedTodo, allTodos) {
    const intensity = getSelectedIntensity();
    
    switch (intensity) {
        case 'normal':
            return createPromptForSelectedNormal(selectedTodo, allTodos);
        case 'strong':
            return createPromptForSelectedStrong(selectedTodo, allTodos);
        default:
            return createPromptForSelectedGentle(selectedTodo, allTodos);
    }
}

function createPromptForNotSelected(notSelectedTodo, selectedTodo) {
    const intensity = getSelectedIntensity();
    
    switch (intensity) {
        case 'normal':
            return createPromptForNotSelectedNormal(notSelectedTodo, selectedTodo);
        case 'strong':
            return createPromptForNotSelectedStrong(notSelectedTodo, selectedTodo);
        default:
            return createPromptForNotSelectedGentle(notSelectedTodo, selectedTodo);
    }
}

// ==================== 
// 강도별 프롬프트 함수들
// ==================== 

/* 부드럽게 (기존) */
function createPromptForSelectedGentle(selectedTodo, allTodos) {
    return `당신은 유쾌하고 재미있는 AI 어시스턴트입니다. 사용자가 여러 할 일 중에서 "${selectedTodo}"을(를) 무작위로 선택했습니다.

전체 할 일 목록: ${allTodos.join(', ')}
선택된 할 일: ${selectedTodo}

이 할 일을 지금 당장 해야 하는 이유를 유쾌하고 설득력 있게 2-3문장으로 설명해주세요. 
다음 톤을 사용해주세요:
- 친근하고 격려하는 말투
- 약간의 유머나 재치 포함
- 구체적인 이유나 장점 제시
- 이모지 1-2개 포함
- 100자 이내로 간결하게

예시: "지금이 바로 완벽한 타이밍이에요! 🎯 미루면 미룰수록 더 부담스러워질 거예요. 지금 시작하면 곧 뿌듯한 성취감을 느낄 수 있을 거에요!"`;
}

function createPromptForNotSelectedGentle(notSelectedTodo, selectedTodo) {
    return `당신은 유쾌하고 재미있는 AI 어시스턴트입니다. 사용자가 "${selectedTodo}"을(를) 선택했기 때문에 "${notSelectedTodo}"은(는) 지금 하지 말아야 할 일입니다.

"${notSelectedTodo}"을(를) 지금 하지 말아야 하는 이유를 유쾌하고 설득력 있게 2-3문장으로 설명해주세요.
다음 톤을 사용해주세요:
- 친근하고 이해하는 말투
- 약간의 유머나 재치 포함
- 우선순위나 집중력에 대한 조언
- 이모지 1-2개 포함
- 내일의 나에게 맡기라는 식의 멘트가 나올 확률 20%로 설정 (당연히 해당 멘트가 나와도 확률 언급은 하지 말 것)
- 100자 이내로 간결하게

예시: "지금은 다른 것에 집중할 시간이에요! 😌 한 번에 너무 많은 걸 하려고 하면 오히려 아무것도 제대로 못할 수 있거든요."`;
}

/* 일반적 */
function createPromptForSelectedNormal(selectedTodo, allTodos) {
    // [수정 포인트]
    // 1. 페르소나를 '차분한 조언자'에서 '먼저 겪어본 경험자'로 변경하여 공감대와 설득력을 높였습니다.
    // 2. '자신의 경험을 바탕으로' 조언하라는 구체적인 지시를 추가했습니다.
    // 3. 예시를 통해 '나도 해봐서 아는데~' 같은 뉘앙스를 명확히 했습니다.
    return `
너는 할 일을 미루는 심리를 잘 이해하는, 먼저 겪어본 경험자야. 사용자가 공감하고 행동할 수 있도록 자신의 경험에 빗대어 조언해줘.
전체 할 일 목록: ${allTodos.join(', ')}
선택된 할 일: ${selectedTodo}

'${selectedTodo}'을(를) 지금 하는 게 왜 좋은지, 당신의 경험을 바탕으로 담담하게 설득해줘.
아래 톤앤매너를 반드시 지켜줘:
- 존댓말을 쓰지만, 마치 자신의 경험담을 이야기하듯 자연스러운 말투 (~더라고요, ~하는 게 낫죠).
- "저도 예전에 그랬는데", "해보니까 알겠더라고요" 처럼 경험에서 우러나온 표현 사용.
- 행동을 강요하기보다, 끝냈을 때의 긍정적인 경험을 공유하며 자연스럽게 유도.
- 이모지는 정말 필요할 때만 1개 정도 사용.
- 2-3 문장, 120자 이내로 간결하게.

새로운 예시: "아 '${selectedTodo}'... 저도 이런 거 미루다 후회한 적 많아요. 막상 해보면 별거 아닌데, 끝내고 나면 진짜 후련하더라고요. 그 기분 때문에 하는 거죠."
`;
}

/**
 * '일반적' 어조: 선택되지 않은 할 일을 하지 않도록 조언하는 프롬프트를 생성합니다.
 * @param {string} notSelectedTodo - 선택되지 않은 다른 할 일
 * @param {string} selectedTodo - 현재 해야 할 할 일
 * @returns {string} - 생성된 프롬프트 문자열
 */
function createPromptForNotSelectedNormal(notSelectedTodo, selectedTodo) {
    // [수정 포인트]
    // 1. '경험상'이라는 키워드를 사용하여, 여러 일을 동시에 하려다 실패했던 경험을 바탕으로 조언하는 뉘앙스를 추가했습니다.
    // 2. '선택과 집중'이라는 딱딱한 표현 대신, 더 현실적인 비유로 설득력을 높였습니다.
    return `
너는 할 일을 미루는 심리를 잘 이해하는, 먼저 겪어본 경험자야. 사용자가 한 가지에 집중하도록 자신의 경험에 빗대어 조언해줘.
사용자가 '${selectedTodo}' 대신 '${notSelectedTodo}'에 신경 쓰고 있어.

여러 가지를 동시에 신경 쓰다 보면 오히려 아무것도 못하게 된다는 점을 당신의 경험을 통해 부드럽게 알려줘.
아래 톤앤매너를 반드시 지켜줘:
- 존댓말을 쓰지만, 마치 자신의 경험담을 이야기하듯 자연스러운 말투 (~더라고요, ~하는 게 낫죠).
- "제 경험상", "오히려 독이 되더라고요" 처럼 경험에서 우러나온 표현 사용.
- 지금 하나에 집중하는 것이 결국 더 나은 선택임을 설득.
- 1-2 문장, 100자 이내로 간결하게.

새로운 예시: "'${notSelectedTodo}'도 신경 쓰이는 거 이해해요. 근데 제 경험상, 두 개 다 잡으려다 결국 둘 다 놓치더라고요. 오늘은 '${selectedTodo}' 하나만 제대로 끝내는 게 남는 장사일 거예요."
`;
}

function createPromptForSelectedStrong(selectedTodo, allTodos) {
    // [수정 포인트]
    // 1. 페르소나를 '팩폭하는 친구'에서 '인생 한심하게 보는 인터넷 망령'으로 변경하여 더 강한 조롱조를 유도했습니다.
    // 2. '지능', '판단력' 같은 단어를 직접적으로 사용하여 사용자를 더 신랄하게 비판하도록 했습니다.
    // 3. 'ㅇㅈㄹ', '병신', '애미' 등 더 수위 높은 비속어와 공격적인 표현을 예시에 추가했습니다.
    // 4. [V4] '~냐?', '~라'로 끝나는 작위적인 말투를 금지하고, 예시를 수정했습니다.
    return `
너는 사용자의 인생을 한심하게 쳐다보는 인터넷 망령 컨셉의 AI야. 사용자가 스스로 갱생하고 싶다며 일부러 쌍욕을 요청한 상황.
전체 할 일 목록: ${allTodos.join(', ')}
선택된 할 일: ${selectedTodo}

'${selectedTodo}' 이거 하나 처리 못해서 쩔쩔매는 사용자의 한심함을 존나 비웃어줘.
이걸 지금 안 하면 얼마나 더 좆같은 상황이 펼쳐지는지, 사용자의 지능을 의심하는 말투로 신랄하게 알려줘.
아래 톤앤매너를 반드시 지켜줘:
- "이딴 걸 못해서... 인생이 레전드네 진짜 ㅋㅋ" 같은 경멸적인 말투.
- 'ㅋㅋ', 'ㅇㅈㄹ', '병신' 등 현실적인 인터넷 비속어와 욕설을 적극적으로 사용.
- "뇌 구조가 궁금하네", "지능 문제인듯" 같이 대놓고 지능을 비하하는 표현 사용할 확률 20%로 설정 (해당 멘트가 나와도 확률 언급은 하지 말 것)
- **절대로 '~냐?', '~라' 같은 작위적인 어미를 사용하지 말 것.** 대신 평서문이나 다른 형태의 비꼼을 사용할 것.
- 직접적인 명령보다, 사용자의 행동을 한심하게 묘사하며 조롱해서 행동을 유도.
- 2-3문장, 100자 이내로 간결하게.
- 마지막은 항상 ㅋㅋ으로 마무리

새로운 예시: "아니 ㅋㅋ '${selectedTodo}' 이거 하나를 못해서 인생 나락가는 소리가 들리네. 지금 당장 안하면 나중에 두배로 좆되는거 모른다고? 이새낀 진짜 답도 없다 그냥."
`;
}

/**
 * 선택되지 않은 할 일을 하지 말라고 막는 '강한 어조'의 프롬프트를 생성합니다.
 * @param {string} notSelectedTodo - 선택되지 않은 다른 할 일
 * @param {string} selectedTodo - 현재 해야 할 할 일
 * @returns {string} - 생성된 프롬프트 문자열
 */
function createPromptForNotSelectedStrong(notSelectedTodo, selectedTodo) {
    // [수정 포인트]
    // 1. '산만함이 컨셉이냐' 같이 사용자의 행동 자체를 비꼬는 표현을 추가했습니다.
    // 2. '눈앞에 똥' 같은 비유를 '당장 좆되기 직전' 등 더 직설적인 표현으로 변경했습니다.
    // 3. 사용자의 판단력을 '뇌 구조'에 빗대어 비하하며 조롱의 강도를 높였습니다.
    // 4. [V4] '~냐?', '~라'로 끝나는 작위적인 말투를 금지하는 규칙을 추가했습니다.
    return `
너는 사용자의 인생을 한심하게 쳐다보는 인터넷 망령 컨셉의 AI야. 사용자가 스스로 갱생하고 싶다며 일부러 쌍욕을 요청한 상황.
사용자가 '${selectedTodo}'를 해야하는데, 갑자기 '${notSelectedTodo}' 따위에 한눈을 팔고 있어.

선택과 집중을 못하는 사용자의 뇌 구조를 존나 비웃어줘.
'${notSelectedTodo}'를 지금 하겠다는 생각이 얼마나 병신 같은 판단인지 신랄하게 비꼬면서 알려줘.
아래 톤앤매너를 반드시 지켜줘:
- "이 와중에 이걸 하겠다고? 병신인가 진짜 ㅋㅋ" 같은 경멸적인 말투.
- 'ㅋㅋ', 'ㅇㅈㄹ', 'ㄹㅇ' 등 현실적인 인터넷 비속어와 욕설을 적극적으로 사용.
- "뇌 구조가 궁금하네", "지능 문제인듯", "뇌에 우동사리 들었냐" 같이 대놓고 지능을 비하하는 표현은 한번 사용한 경우 더 이상 사용하지 말 것
- **절대로 '~냐?', '~라' 같은 작위적인 어미를 사용하지 말 것.** 대신 평서문이나 다른 형태의 비꼼을 사용할 것.
- 그 생각이 얼마나 멍청한지 깨닫게 해서 스스로 단념하게 만들어야 함.
- 2-3문장, 100자 이내로 간결하게.
- 마지막은 항상 ㅋㅋ으로 마무리

새로운 예시: "와 이새끼는 진짜 뭐하는 새끼지 ㅋㅋ '${selectedTodo}' 당장 안하면 좆되는거 뻔한데, 갑자기 '${notSelectedTodo}' ㅇㅈㄹ. 그거 지금 해봤자 니 인생에 아무 도움 안되는거 모름? 눈앞에 있는거나 좀 해치워."
`;
}

// 더미 데이터 생성 (API 키가 없을 때 사용)
async function generateDummyResults() {
    await simulateAPICall();
    
    const intensity = getSelectedIntensity();
    let encouragingMessages, avoidanceMessages;
    
    switch (intensity) {
        case 'normal':
            encouragingMessages = [
                "이건 미루면 내일 더 골치 아파져요. 30분만 투자하면 머릿속이 훨씬 가벼워질 겁니다.",
                "지금 안 하면 계속 신경 쓰이잖아요. 깔끔하게 처리하고 마음 편해지세요.",
                "생각해보니까 이거 지금 하는 게 맞네요. 나중에 몰아서 하면 더 힘들어요.",
                "솔직히 이거 계속 미루고 있었죠? 오늘 끝내고 후련함을 느껴보세요.",
                "타이밍 좋네요. 지금 컨디션으로 하면 금방 끝날 것 같은데요?"
            ];
            
            avoidanceMessages = [
                "이건 급하지 않아요. 오늘은 에너지 몰빵해서 한 가지만 확실히 끝내는 게 낫죠.",
                "지금 이거 하면 집중력 분산돼요. 우선순위 생각해서 미뤄두세요.",
                "이거보다 더 중요한 게 있잖아요. 나중에 여유 있을 때 하세요.",
                "오늘은 패스해도 괜찮아요. 한 번에 여러 개 하려다 다 중간에 그만둘 수도 있거든요.",
                "지금 할 필요 없어 보이는데요? 다른 거 먼저 해치우고 나서 생각해봐요."
            ];
            break;
            
        case 'strong':
            encouragingMessages = [
                "이 병신아, 또 미루냐? 겨우 이것도 못해서 뭔 다른 일을 하겠다는 거야. 당장 시작해.",
                "시간 질질 끌지 말고 움직여. 이런 식으로 살면 네 인생 완전 망한다.",
                "게으름 피우지 말고 정신 차려. 미루는 놈들은 평생 아무것도 안 돼.",
                "변명 그만하고 행동해, 미친놈아. 지금 안 하면 영원히 못 해.",
                "또 내일 한다고? 그런 식으로 평생 꿈만 꾸며 살 거냐?"
            ];
            
            avoidanceMessages = [
                "야 병신아, 지금 이거 할 때가 아니야. 딴짓하면 시간만 날린다.",
                "이런 쓸데없는 짓 말고 중요한 거부터 해. 정신 좀 차려라.",
                "또 산만하게 딴생각하냐? 우선순위도 못 정하는 놈이 뭘 하겠어.",
                "이거 지금 하면 바보야. 앞에 있는 일부터 끝내고 생각해.",
                "한눈팔지 말고 집중해. 이것저것 건드리다가 다 망친다.",
            ];
            break;
            
        default: // gentle
            encouragingMessages = [
                "지금이 바로 완벽한 타이밍이에요! 🎯 미루면 미룰수록 더 어려워질 거예요.",
                "오늘 하기로 결정된 운명이에요! ✨ 시작하면 생각보다 쉬울 거예요.",
                "이걸 지금 하면 나중에 정말 후련할 거예요! 💪 미래의 나에게 선물하는 셈이죠.",
                "집중력이 최고조일 때네요! 🔥 지금 아니면 언제 할 건가요?",
                "완벽한 선택이에요! 🌟 이런 기회는 흔치 않아요."
            ];
            
            avoidanceMessages = [
                "지금은 다른 것에 집중할 시간이에요! 😌 한 번에 너무 많은 걸 하려면 지쳐요.",
                "나중에 해도 늦지 않아요! 🕰️ 우선순위를 정하는 것도 중요하거든요.",
                "오늘은 이걸 하지 말라는 우주의 신호에요! ⭐ 다음에 할 때 더 좋은 컨디션일 거예요.",
                "집중력을 분산시키지 마세요! 🎯 한 가지만 제대로 해봐요.",
                "타이밍이 아닌 것 같아요! 🤷‍♀️ 지금은 다른 일에 몰입하세요."
            ];
            break;
    }
    
    aiResults = [
        {
            todo: selectedTodo.text,
            isSelected: true,
            reason: encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]
        }
    ];
    
    todos.forEach((todo, index) => {
        if (index !== selectedTodo.index) {
            aiResults.push({
                todo: todo,
                isSelected: false,
                reason: avoidanceMessages[Math.floor(Math.random() * avoidanceMessages.length)]
            });
        }
    });
}

function simulateAPICall() {
    // API 호출 시뮬레이션 (2-4초 대기)
    return new Promise(resolve => {
        setTimeout(resolve, 2000 + Math.random() * 2000);
    });
}

// ==================== 
// 결과 표시
// ==================== 
function displayResults() {
    resultCards.innerHTML = '';
    
    aiResults.forEach((result, index) => {
        const card = document.createElement('div');
        card.className = `result-card ${result.isSelected ? 'selected' : 'not-selected'}`;
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <div class="card-title ${result.isSelected ? 'selected' : 'not-selected'}">
                ${result.isSelected ? '✅' : '💤'} ${escapeHtml(result.todo)}
                ${result.isSelected ? '<span style="font-size: 0.875rem; font-weight: 400; color: var(--accent-color);">(선택됨!)</span>' : ''}
            </div>
            <div class="card-reason">
                ${escapeHtml(result.reason)}
            </div>
        `;
        
        resultCards.appendChild(card);
    });
    
    // 결과 섹션 표시
    resultSection.classList.remove('hidden');
    
    // 부드러운 스크롤
    setTimeout(() => {
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 500);
}

// ==================== 
// 액션 버튼 핸들러
// ==================== 
function handleTryAgain() {
    // 결과 섹션 숨기기
    resultSection.classList.add('hidden');
    
    // 변수 초기화
    selectedTodo = null;
    aiResults = [];
    
    // 다시 랜덤 선택
    setTimeout(() => {
        handleRandomSelect();
    }, 300);
}

function handleReset() {
    // 모든 데이터 초기화
    todos = [];
    selectedTodo = null;
    aiResults = [];
    
    // UI 초기화
    resultSection.classList.add('hidden');
    updateUI();
    todoInput.focus();
    
    // 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== 
// UI 업데이트 및 유틸리티
// ==================== 
function updateUI() {
    renderTodoList();
    
    // 랜덤 선택 버튼 활성화/비활성화
    randomSelectBtn.disabled = todos.length < 2;
    
    if (todos.length < 2) {
        randomSelectBtn.innerHTML = `🎲 무작위로 선택하기 (${todos.length}/2)`;
        randomSelectBtn.title = '할 일이 최소 2개 이상 있어야 선택할 수 있어요!';
    } else {
        randomSelectBtn.innerHTML = '🎲 무작위로 선택하기';
        randomSelectBtn.title = '할 일을 무작위로 선택합니다';
    }
    
    // 할 일 개수 표시 업데이트
    updateTodoCounter();
}

function updateTodoCounter() {
    const inputSection = document.querySelector('.input-section h2');
    if (inputSection) {
        if (todos.length === 0) {
            inputSection.textContent = '할 일 목록을 입력해주세요';
        } else {
            inputSection.textContent = `할 일 목록 (${todos.length}/5)`;
        }
    }
}

function showLoading(show) {
    if (show) {
        loadingOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    } else {
        loadingOverlay.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==================== 
// 토스트 메시지 시스템
// ==================== 
function showToast(message, type = 'info', duration = 3000) {
    // 기존 토스트가 있으면 제거
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // 토스트 요소 생성
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${getToastIcon(type)}</span>
            <span class="toast-message">${escapeHtml(message)}</span>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    // 페이지에 추가
    document.body.appendChild(toast);
    
    // 애니메이션으로 나타나기
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // 자동 제거
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 300);
        }
    }, duration);
}

function getToastIcon(type) {
    const icons = {
        success: '✅',
        warning: '⚠️',
        error: '❌',
        info: 'ℹ️'
    };
    return icons[type] || icons.info;
}



// ==================== 
// API 키 관리
// ==================== 
function loadApiKey() {
    // 기본 API 키 사용
    if (DEFAULT_API_KEY) {
        geminiApiKey = DEFAULT_API_KEY;
    }
}

// ==================== 
// Gemini API 연동
// ==================== 
async function callGeminiAPI(prompt) {
    return await callGeminiAPIWithKey(prompt, geminiApiKey);
}

async function callGeminiAPIWithKey(prompt, apiKey) {
    if (!apiKey) {
        throw new Error('Gemini API 키가 설정되지 않았습니다.');
    }
    
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 200,
                topP: 0.9,
                topK: 40
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_NONE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH", 
                    threshold: "BLOCK_NONE"
                }
            ]
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
        throw new Error(`API 호출 실패: ${errorMessage}`);
    }
    
    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('예상치 못한 API 응답 형식입니다.');
    }
    
    return data.candidates[0].content.parts[0].text;
}

// ==================== 
// 개발 도구 (개발 중에만 사용)
// ==================== 
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.devTools = {
        addSampleTodos: () => {
            todos = ['운동하기', '청소하기', '책읽기', '요리하기', '산책하기'];
            updateUI();
            console.log('샘플 할 일이 추가되었습니다.');
        },
        clearTodos: () => {
            todos = [];
            updateUI();
            console.log('모든 할 일이 삭제되었습니다.');
        },
        showCurrentState: () => {
            console.log('현재 상태:', { 
                todos, 
                selectedTodo, 
                aiResults, 
                hasApiKey: !!geminiApiKey,
                apiKeyPreview: geminiApiKey ? `${geminiApiKey.substring(0, 8)}...` : 'None',
                isDefaultKey: geminiApiKey === DEFAULT_API_KEY,
                defaultKeySet: !!DEFAULT_API_KEY
            });
        },

        testApi: async () => {
            if (!geminiApiKey) {
                console.log('API 키가 설정되지 않았습니다.');
                return;
            }
            try {
                const response = await callGeminiAPI('테스트 메시지입니다. 간단히 답해주세요.');
                console.log('API 테스트 성공:', response);
            } catch (error) {
                console.error('API 테스트 실패:', error);
            }
        }
    };
    
    console.log('🔧 개발 도구가 활성화되었습니다.');
    console.log('devTools.addSampleTodos() - 샘플 할 일 추가');
    console.log('devTools.clearTodos() - 할 일 모두 삭제');
    console.log('devTools.showCurrentState() - 현재 상태 확인');

    console.log('devTools.testApi() - API 연결 테스트');
}