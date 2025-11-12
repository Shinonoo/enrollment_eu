// year-end-preview.js

async function fetchPreview() {
    const response = await fetch('/api/sections/succession/preview');
    const data = await response.json();
    if (!data.success) {
        alert('Failed to load preview: ' + data.error);
        return;
    }
    const tbody = document.querySelector('#previewTable tbody');
    tbody.innerHTML = '';

    let hasMissingMapping = false;

    data.students.forEach(student => {
        if (!student.nextSection) hasMissingMapping = true;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.currentGrade}</td>
            <td>${student.currentSection}</td>
            <td>${student.nextSection || 'None'}</td>
            <td class="${student.nextSection ? '' : 'missing'}">
                ${student.nextSection ? 'Mapped' : 'Missing Section Mapping'}
            </td>
        `;
        tbody.appendChild(row);
    });

    const promoteBtn = document.getElementById('promoteBtn');
    promoteBtn.disabled = hasMissingMapping;

    const promotionStatus = document.getElementById('promotionStatus');
    if (hasMissingMapping) {
        promotionStatus.textContent = 'Resolve missing section mappings before promoting.';
        promotionStatus.style.color = 'red';
    } else {
        promotionStatus.textContent = 'All mappings valid. You can promote students now.';
        promotionStatus.style.color = 'green';
    }
}

document.getElementById('refreshBtn').addEventListener('click', fetchPreview);

document.getElementById('promoteBtn').addEventListener('click', async () => {
    if (!confirm("Are you sure you want to promote eligible students?")) return;

    const promotionStatus = document.getElementById('promotionStatus');
    promotionStatus.textContent = 'Processing promotion...';
    promotionStatus.style.color = 'black';

    const response = await fetch('/api/sections/succession/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();

    if (data.success) {
        promotionStatus.textContent = `Promotion successful! ${data.promotedCount} students promoted.`;
        promotionStatus.style.color = 'green';
        fetchPreview();
    } else {
        promotionStatus.textContent = `Promotion failed: ${data.error}`;
        promotionStatus.style.color = 'red';
    }
});

window.onload = fetchPreview;
