const navButtons = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');
const roleLabel = document.querySelector('.role-select span:first-child');
const blueprintMode = new URLSearchParams(window.location.search).get('mode') === 'blueprint';

if (blueprintMode) {
  document.body.classList.add('blueprint-mode');
  roleLabel?.classList.add('blueprint-role');

  const textNodes = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodesToReplace = [];
  while (textNodes.nextNode()) {
    const node = textNodes.currentNode;
    if (
      node.textContent.trim() &&
      !node.parentElement.closest('.blueprint-role, script, style')
    ) {
      nodesToReplace.push(node);
    }
  }

  nodesToReplace.forEach((node) => {
    const placeholder = document.createElement('span');
    const width = Math.max(2, Math.min(22, node.textContent.trim().length * 0.48));
    placeholder.className = 'blueprint-placeholder';
    placeholder.setAttribute('aria-hidden', 'true');
    placeholder.style.setProperty('--placeholder-width', `${width}em`);
    node.replaceWith(placeholder);
  });

  document.querySelectorAll('input:not([type="checkbox"]), textarea').forEach((field) => {
    field.value = '';
    field.placeholder = '';
  });
}

function setRole(role) {
  const isApprover = role === 'approver';
  document.body.classList.toggle('approver-mode', isApprover);
  if (roleLabel) {
    roleLabel.textContent = isApprover ? 'Approver' : 'Client';
  }
  navButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.view === (isApprover ? 'dashboard' : 'requests'));
  });
}

function showView(targetId, role) {
  document.body.classList.remove('auth-mode');
  if (role) {
    document.body.classList.toggle('approver-mode', role === 'approver');
    if (roleLabel) {
      roleLabel.textContent = role === 'approver' ? 'Approver' : 'Client';
    }
  }
  views.forEach((view) => {
    view.classList.toggle('active', view.id === targetId);
  });
}

navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    navButtons.forEach((item) => item.classList.toggle('active', item === button));
    const target = `${button.dataset.view}-view`;
    const role = button.dataset.view.startsWith('approver-') ||
      ['dashboard', 'analytics', 'reports'].includes(button.dataset.view)
      ? 'approver'
      : 'client';
    showView(target, role);
  });
});

const authButton = document.querySelector('.primary-btn.large');
if (authButton) {
  authButton.addEventListener('click', () => {
    setRole('client');
    showView('requests-view', 'client');
  });
}

document.querySelectorAll('[data-switch-role]').forEach((button) => {
  button.addEventListener('click', () => {
    const role = button.dataset.switchRole;
    setRole(role);
    showView(role === 'approver' ? 'dashboard-view' : 'requests-view', role);
  });
});

document.querySelectorAll('[data-go-view]').forEach((button) => {
  button.addEventListener('click', () => {
    const target = `${button.dataset.goView}-view`;
    navButtons.forEach((item) => item.classList.toggle('active', item.dataset.view === button.dataset.goView));
    showView(target, 'approver');
  });
});

const roleSwitch = document.querySelector('.role-select');
if (roleSwitch) {
  roleSwitch.addEventListener('click', () => {
    const isApprover = document.body.classList.contains('approver-mode');
    const nextRole = isApprover ? 'client' : 'approver';
    setRole(nextRole);
    showView(nextRole === 'approver' ? 'dashboard-view' : 'requests-view', nextRole);
  });
}
