/** 2. UI 렌더링 함수 **/

// 왼쪽 그룹 사이드바 렌더링
// renderGroups 함수 내 HTML 구조 변경
function renderGroups() {
    const container = document.getElementById('groupList');
    container.innerHTML = '';

    const lang_all = i18n['all'];
    const lang_none = i18n['none'];

    Object.keys(MOVES_IN_GROUP_DB).forEach(group => {
        const div = document.createElement('div');
        div.className = `group-item ${group === currentGroup ? 'active' : ''}`;
        
        // 버튼 자체를 클릭하면 그룹 변경
        div.onclick = () => { 
            currentGroup = group; 
            renderGroups(); 
            renderMoves(); 
        };

        const total = MOVES_IN_GROUP_DB[group].length;
        const selected = MOVES_IN_GROUP_DB[group].filter(m => tempSelectedMoves[m]).length;

        div.innerHTML = `
            <div class="group-title">
                ${group}<br>
                <span style="font-size:0.75rem; color:var(--primary); font-weight:normal;">
                    (${selected}/${total})
                </span>
            </div>
            <div class="group-controls">
                <label onclick="event.stopPropagation()">
                    <input type="checkbox" ${selected === total ? 'checked' : ''} 
                        onchange="groupSelect('${group}', true)">
                    <span>${lang_all}</span>
                </label>
                <label onclick="event.stopPropagation()">
                    <input type="checkbox" ${selected === 0 ? 'checked' : ''} 
                        onchange="groupSelect('${group}', false)">
                    <span>${lang_none}</span>
                </label>
            </div>
        `;
        container.appendChild(div);
    });
    updateTotalCount();
}
// 오른쪽 동작 리스트 렌더링
function renderMoves() {
    const container = document.getElementById('moveList');
    container.innerHTML = `<h3 style="padding-left:10px;">${currentGroup}</h3>`;

    MOVES_IN_GROUP_DB[currentGroup].forEach(move => {
        const isSelected = tempSelectedMoves[move];
        const div = document.createElement('div');
        
        // 아이템 전체에 active/inactive 클래스 적용
        div.className = `move-item ${isSelected ? 'active' : 'inactive'}`;
        
        // 전체 영역 클릭 시 동작 호출
        div.onclick = () => toggleMove(move);

        div.innerHTML = `
            <span style="font-size: 1.1rem; font-weight: 500;">${move}</span>
            <input type="checkbox" ${isSelected ? 'checked' : ''}>
        `;
        container.appendChild(div);
    });
}

/** 3. 로직 제어 함수 **/

function toggleMove(move) {
    tempSelectedMoves[move] = !tempSelectedMoves[move];
    renderGroups();
    renderMoves();
}

function groupSelect(group, isAll) {
    // 1. 클릭된 체크박스의 그룹을 '현재 그룹'으로 설정 (화면 전환)
    currentGroup = group;

    // 2. 해당 그룹 내의 모든 동작 상태 변경
    MOVES_IN_GROUP_DB[group].forEach(move => {
        tempSelectedMoves[move] = isAll;
    });

    // 3. UI 갱신 (왼쪽 그룹 카드들과 오른쪽 리스트 모두 다시 그리기)
    renderGroups();
    renderMoves();
}

function globalSelect(isAll) {
    Object.keys(tempSelectedMoves).forEach(move => {
        tempSelectedMoves[move] = isAll;
    });
    renderGroups();
    renderMoves();
}

function updateTotalCount() {
    const total = Object.values(tempSelectedMoves).filter(v => v).length;
    document.getElementById('selectedCount').innerText = i18n['selected'] + `: ${total}`;
}

/** 4. 페이지 전환 **/

function openSelectionPage() {
    // 현재의 진짜 설정을 복사해서 임시 저장소에 넣습니다. (깊은 복사)
    tempSelectedMoves = JSON.parse(JSON.stringify(selectedMoves));

    document.getElementById('selectionPage').style.display = 'flex';
    renderGroups();
    renderMoves();
}

function closeSelectionPage() {

    // 여기서 실제로 추출된 [selectedMoves] 중 true인 것들만 모아 
    // 기존 앱의 shuffledWords 배열로 전달하는 로직이 들어갑니다.
    // 1. 선택된 동작들의 이름(키값)만 배열로 추출
    const finalSelection = Object.keys(tempSelectedMoves).filter(m => tempSelectedMoves[m]);
    // 2. 만약 하나도 선택 안 했다면 경고 (또는 전체 선택으로 복구)
    if (finalSelection.length === 0) {
        alert(i18n['alert_min_one']);
        return;
    }
    // 임시 데이터를 진짜 데이터로 확정!
    selectedMoves = tempSelectedMoves;

    document.getElementById('selectionPage').style.display = 'none';
    // 3. 기존의 루틴 생성 로직에 전달
    // (이전에는 Object.keys(VOICE_ASSETS) 전체를 썼다면, 이제는 finalSelection만 사용)
    saveSelection();

    shuffledWords = finalSelection;
}
// [취소 버튼] - 새로 추가
function cancelSelection() {
    // 아무것도 저장하지 않고 그냥 닫아버립니다. 
    // tempSelectedMoves는 다음 오픈 시 초기화되므로 상관없습니다.
    document.getElementById('selectionPage').style.display = 'none';
}

// 초기화 및 모바일 높이 보정
function resetHeight() { document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`); }

function playHaptic() { if ("vibrate" in navigator) navigator.vibrate(40); }
