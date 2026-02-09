var API_BASE = 'http://localhost:8000';
var chatSessionId = '';

function generateSessionId() {
  return (
    'sess-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9)
  );
}

function chatAddMessage(text, isUser) {
  var container = document.getElementById('chat-messages');
  var wrapper = document.createElement('div');
  wrapper.className = isUser ? 'flex justify-end' : 'flex justify-start';

  var bubble = document.createElement('div');
  bubble.className = isUser
    ? 'bg-blue-600 text-white rounded-xl rounded-tl-sm px-4 py-2.5 max-w-[75%]'
    : 'bg-gray-100 rounded-xl rounded-tr-sm px-4 py-2.5 max-w-[75%]';

  var p = document.createElement('p');
  p.className = 'text-sm' + (isUser ? '' : ' text-gray-800');
  p.dir = 'auto';
  p.textContent = text;

  bubble.appendChild(p);
  wrapper.appendChild(bubble);
  container.appendChild(wrapper);
  container.scrollTop = container.scrollHeight;
}

function chatAddLoading() {
  var container = document.getElementById('chat-messages');
  var wrapper = document.createElement('div');
  wrapper.className = 'flex justify-start';
  wrapper.id = 'chat-loading';

  var bubble = document.createElement('div');
  bubble.className =
    'bg-gray-100 rounded-xl rounded-tr-sm px-4 py-3 max-w-[75%]';
  bubble.innerHTML =
    '<div class="flex gap-1.5 items-center">' +
    '<span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:0ms"></span>' +
    '<span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:150ms"></span>' +
    '<span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:300ms"></span>' +
    '</div>';

  wrapper.appendChild(bubble);
  container.appendChild(wrapper);
  container.scrollTop = container.scrollHeight;
}

function chatRemoveLoading() {
  var el = document.getElementById('chat-loading');
  if (el) el.remove();
}

function chatSend() {
  var input = document.getElementById('chat-input');
  var errorEl = document.getElementById('chat-error');
  var sendBtn = document.getElementById('chat-send-btn');
  var message = input.value.trim();

  // Validation
  errorEl.classList.add('hidden');
  errorEl.textContent = '';

  if (message === '') {
    errorEl.textContent = 'يرجى كتابة رسالة';
    errorEl.classList.remove('hidden');
    return;
  }

  // Init session on first message
  if (chatSessionId === '') {
    chatSessionId = generateSessionId();
  }

  // Show user message
  chatAddMessage(message, true);
  input.value = '';

  // Disable input
  sendBtn.disabled = true;
  sendBtn.classList.add('opacity-50', 'cursor-not-allowed');
  input.disabled = true;
  chatAddLoading();

  // Ajax
  var xhr = new XMLHttpRequest();
  xhr.open('POST', API_BASE + '/message');
  xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onload = function () {
    chatRemoveLoading();
    sendBtn.disabled = false;
    sendBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    input.disabled = false;
    input.focus();

    if (xhr.status === 200) {
      var data = JSON.parse(xhr.responseText);

      // Update session id from server
      if (data.session_id) {
        chatSessionId = data.session_id;
      }

      // Show reply
      chatAddMessage(data.reply, false);

      // Show rankings if completed
      if (
        data.is_completed &&
        data.final_rankings &&
        data.final_rankings.rankresumes
      ) {
        chatShowRankings(data.final_rankings.rankresumes);

        // Hide input, show restart button
        document.getElementById('chat-input-area').classList.add('hidden');
        document.getElementById('chat-restart-area').classList.remove('hidden');
      }
    } else if (xhr.status === 422) {
      var err = JSON.parse(xhr.responseText);
      errorEl.textContent = err.detail[0].msg || 'خطأ في البيانات المرسلة';
      errorEl.classList.remove('hidden');
    } else {
      errorEl.textContent = 'حدث خطأ في الخادم (رمز ' + xhr.status + ')';
      errorEl.classList.remove('hidden');
    }
  };

  xhr.onerror = function () {
    chatRemoveLoading();
    sendBtn.disabled = false;
    sendBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    input.disabled = false;
    errorEl.textContent = 'تعذر الاتصال بالخادم';
    errorEl.classList.remove('hidden');
  };

  xhr.send(
    JSON.stringify({
      session_id: chatSessionId,
      message: message,
    }),
  );
}

function chatRestart() {
  chatSessionId = '';
  document.getElementById('chat-messages').innerHTML =
    '<div class="flex justify-start">' +
    '<div class="bg-gray-100 rounded-xl rounded-tr-sm px-4 py-2.5 max-w-[75%]">' +
    '<p class="text-sm text-gray-800">مرحباً! أنا مساعد التوظيف الذكي. كيف يمكنني مساعدتك؟</p>' +
    '</div></div>';
  document.getElementById('chat-rankings').classList.add('hidden');
  document.getElementById('chat-rankings-body').innerHTML = '';
  document.getElementById('chat-input').value = '';
  document.getElementById('chat-error').classList.add('hidden');
  document.getElementById('chat-restart-area').classList.add('hidden');
  document.getElementById('chat-input-area').classList.remove('hidden');
}

function chatShowRankings(resumes) {
  var rankingsEl = document.getElementById('chat-rankings');
  var tbody = document.getElementById('chat-rankings-body');
  tbody.innerHTML = '';

  for (var i = 0; i < resumes.length; i++) {
    var r = resumes[i];
    var tr = document.createElement('tr');
    tr.className = 'border-b last:border-0 hover:bg-gray-50';
    tr.innerHTML =
      '<td class="px-4 py-2 font-semibold text-blue-600">' +
      r.rank +
      '</td>' +
      '<td class="px-4 py-2">' +
      escapeHtml(r.name) +
      '</td>' +
      '<td class="px-4 py-2"><span class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">' +
      r.score +
      '</span></td>' +
      '<td class="px-4 py-2 text-gray-500">' +
      r.resume_id +
      '</td>';
    tbody.appendChild(tr);
  }

  rankingsEl.classList.remove('hidden');
}
