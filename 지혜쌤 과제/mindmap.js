
  const nodeLayer = document.getElementById('node-layer');
  const svg = document.getElementById('line-layer');
  const status = document.getElementById('status');

  let nodes = [];
  let connections = [];
  let nodeIdCounter = 0;

  let connectMode = false;
  let connectFromNode = null;

  document.getElementById('add-node-btn').addEventListener('click', () => {
    const id = `node-${nodeIdCounter++}`;
    const node = document.createElement('div');
    node.className = 'node';
    node.innerText = '노드';
    node.style.left = `${100 + nodeIdCounter * 50}px`;
    node.style.top = `${100 + nodeIdCounter * 30}px`;
    node.setAttribute('data-id', id);

let deleteMode = false;

const delBtn = document.getElementById('del-node-btn');
delBtn.addEventListener('click', () => {
  deleteMode = !deleteMode;
  if (deleteMode) {
    updateStatus('삭제할 노드를 클릭하세요.');
    delBtn.innerText = '삭제 모드 ON';
    delBtn.style.backgroundColor = '#ef4444';
  } else {
    updateStatus('');
    delBtn.innerText = '노드 삭제';
    delBtn.style.backgroundColor = '#3b82f6';
  }
});


    // 텍스트 수정 기능
    node.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      startEditing(node);
    });

    // 연결 기능: 노드 클릭시
node.addEventListener('click', (e) => {
  e.stopPropagation();

  if (deleteMode) {
    const idToDelete = node.getAttribute('data-id');

    // 연결 제거
    connections = connections.filter(([from, to]) => from !== idToDelete && to !== idToDelete);

    // 노드 제거
    node.remove();
    nodes = nodes.filter(n => n.id !== idToDelete);
    drawLines();

    // 삭제 모드 종료
    return;
  }

  if (connectMode) {
    // 연결 모드일 때 처리
    if (!connectFromNode && delBtn?.innerText === '노드 삭제') {
      connectFromNode = node;
      updateStatus(`연결 시작: ${connectFromNode.innerText}`);
      node.style.borderColor = '#2563eb';
    } else if (connectFromNode === node) {
      resetConnectMode();
    } else {
      createConnection(connectFromNode.getAttribute('data-id'), node.getAttribute('data-id'));
      resetConnectMode();
    }
  } else {
    selectNode(node); // 일반 선택
  }
});


    makeDraggable(node);
    nodeLayer.appendChild(node);
    nodes.push({ id, element: node });
    drawLines();
  });

  const connectBtn = document.getElementById('connect-mode-btn');
  connectBtn.addEventListener('click', () => {
    connectMode = !connectMode;
    connectFromNode = null;
    if (connectMode) {
      connectBtn.classList.add('active');
      connectBtn.innerText = '연결 모드 ON';
      updateStatus('연결할 첫 노드를 클릭하세요.');
    } else {
      connectBtn.classList.remove('active');
      connectBtn.innerText = '연결 모드 OFF';
      updateStatus('');
      clearNodeBorders();
    }
  });

  function updateStatus(text) {
    status.innerText = text;
  }

  function resetConnectMode() {
    if (connectFromNode) connectFromNode.style.borderColor = '#e5e7eb';
    connectFromNode = null;
    updateStatus('첫 노드를 선택해주세요.');
  }

  function clearNodeBorders() {
    nodes.forEach(n => {
      n.element.style.borderColor = '#e5e7eb';
    });
  }

  function createConnection(fromId, toId) {
    if (connections.some(c => (c[0] === fromId && c[1] === toId) || (c[0] === toId && c[1] === fromId))) {
      alert('이미 연결된 노드입니다.');
      return;
    }
    connections.push([fromId, toId]);
    drawLines();
  }

  function drawLines() {
    svg.innerHTML = '';
    connections.forEach(([fromId, toId]) => {
      const fromNode = nodes.find(n => n.id === fromId)?.element;
      const toNode = nodes.find(n => n.id === toId)?.element;
      if (!fromNode || !toNode) return;

      const x1 = fromNode.offsetLeft + fromNode.offsetWidth / 2;
      const y1 = fromNode.offsetTop + fromNode.offsetHeight / 2;
      const x2 = toNode.offsetLeft + toNode.offsetWidth / 2;
      const y2 = toNode.offsetTop + toNode.offsetHeight / 2;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.setAttribute('stroke', '#9ca3af');
      line.setAttribute('stroke-width', '2');
      line.setAttribute('pointer-events', 'none');
      svg.appendChild(line);
    });
  }

  function makeDraggable(el) {
    let offsetX, offsetY;

    el.addEventListener('mousedown', (e) => {
      if (el.classList.contains('editing')) return;

      offsetX = e.offsetX;
      offsetY = e.offsetY;

      function onMouseMove(e) {
        el.style.left = `${e.pageX - offsetX}px`;
        el.style.top = `${e.pageY - offsetY}px`;
        drawLines();
      }
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', onMouseMove);
      }, { once: true });
    });
  }

  function startEditing(node) {
    if (node.classList.contains('editing')) return;

    const currentText = node.innerText;
    node.classList.add('editing');
    node.contentEditable = true;
    node.focus();

    function finishEditing() {
      node.classList.remove('editing');
      node.contentEditable = false;
      if (node.innerText.trim() === '') {
        node.innerText = currentText;
      }
      node.removeEventListener('blur', finishEditing);
      node.removeEventListener('keydown', onKeyDown);
    }
    function onKeyDown(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        finishEditing();
      }
    }

    node.addEventListener('blur', finishEditing);
    node.addEventListener('keydown', onKeyDown);
  }
