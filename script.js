// --- Constants and Grade Mapping ---
const GRADE_MAP = [
    { value: 4.0, label: 'A (4.0)', letter: 'A' },
    { value: 3.7, label: 'A- (3.7)', letter: 'A-' },
    { value: 3.3, label: 'B+ (3.3)', letter: 'B+' },
    { value: 3.0, label: 'B (3.0)', letter: 'B' },
    { value: 2.7, label: 'B- (2.7)', letter: 'B-' },
    { value: 2.3, label: 'C+ (2.3)', letter: 'C+' },
    { value: 2.0, label: 'C (2.0)', letter: 'C' },
    { value: 1.7, label: 'C- (1.7)', letter: 'C-' },
    { value: 1.3, label: 'D+ (1.3)', letter: 'D+' },
    { value: 1.0, label: 'D (1.0)', letter: 'D' },
    { value: 0.7, label: 'D- (0.7)', letter: 'D-'},
    { value: 0.0, label: 'F (0.0)', letter: 'F' }
];

// --- DOM Elements ---
const coursesDiv = document.getElementById('courses');
const addCourseBtn = document.getElementById('addCourseBtn');
const addRetakeBtn = document.getElementById('addRetakeBtn');
const cgpaForm = document.getElementById('cgpaForm');
const resultBox = document.getElementById('resultBox');
const cgpaValue = document.getElementById('cgpaValue');
const gradeValue = document.getElementById('gradeValue');
const includePreviousCgpa = document.getElementById('includePreviousCgpa');
const previousInputs = document.getElementById('previousInputs');
const previousCgpaInput = document.getElementById('previousCgpa');
const previousCreditsInput = document.getElementById('previousCredits');
const printBtn = document.getElementById('printBtn');
const cgpaDetails = document.getElementById('cgpaDetails');
const creditDetails = document.getElementById('creditDetails');

// --- Utility Functions ---
function createGradeOptions(selectedValue = '') {
    return [
        '<option value="">Grade</option>',
        ...GRADE_MAP.map(g => `<option value="${g.value}"${selectedValue == g.value ? ' selected' : ''}>${g.label}</option>`)
    ].join('');
}

function getLetterGrade(cgpa) {
    for (const g of GRADE_MAP) {
        if (cgpa >= g.value) return g.letter;
    }
    return 'F';
}

function clearResults() {
    resultBox.style.display = 'block';
    cgpaValue.textContent = '0.00';
    gradeValue.textContent = '-';
    cgpaDetails.style.display = 'none';
    creditDetails.style.display = 'none';
}

// --- Course Row Creation ---
function createCourseRow(courseId = '', credit = '', grade = '', isRetake = false) {
    const row = document.createElement('div');
    row.className = 'input-row';
    const binIcon = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5.5" y="8" width="1.5" height="6" rx="0.75" fill="#ef4444"/><rect x="9.25" y="8" width="1.5" height="6" rx="0.75" fill="#ef4444"/><rect x="13" y="8" width="1.5" height="6" rx="0.75" fill="#ef4444"/><path d="M4 6.5H16M8.5 3.5H11.5C12.0523 3.5 12.5 3.94772 12.5 4.5V5.5H7.5V4.5C7.5 3.94772 7.94772 3.5 8.5 3.5Z" stroke="#ef4444" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><rect x="4.5" y="5.5" width="11" height="11" rx="2" stroke="#ef4444" stroke-width="1.2"/></svg>`;
    row.innerHTML = `
        <div class="col-courseid"><input type="text" placeholder="Course ID" maxlength="10" value="${courseId}" required></div>
        <div class="col-credits"><input type="number" placeholder="Credits" min="1" max="6" value="${credit}" required></div>
        <div class="col-grade"><select required>${createGradeOptions(grade)}</select></div>
        <span class="col-type" style="color:${isRetake ? '#a78bfa' : '#6366f1'};">${isRetake ? 'R' : 'Regular'}</span>
        <div class="col-delete"><button type="button" class="delete-btn" title="Delete">${binIcon}</button></div>
    `;
    row.querySelector('.delete-btn').onclick = () => row.remove();
    coursesDiv.appendChild(row);
}

function getCourseRows() {
    return Array.from(coursesDiv.querySelectorAll('.input-row'));
}

function parseCourseRow(row) {
    const inputs = row.querySelectorAll('input, select');
    const courseId = inputs[0].value.trim().toUpperCase();
    const credits = parseFloat(inputs[1].value);
    const grade = parseFloat(inputs[2].value);
    const isRetake = row.innerHTML.includes('>R<');
    return { courseId, credits, grade, isRetake };
}

// --- Event Handlers ---
addCourseBtn.onclick = () => createCourseRow();
addRetakeBtn.onclick = () => createCourseRow('', '', '', true);

// Add two default rows
createCourseRow();
createCourseRow();

includePreviousCgpa.onchange = function() {
    previousInputs.style.display = this.checked ? 'block' : 'none';
};

printBtn.onclick = function() {
    window.print();
};

cgpaForm.onsubmit = function(e) {
    e.preventDefault();
    const rows = getCourseRows();
    let totalCredits = 0, totalPoints = 0, valid = true;
    const retakeMap = {};
    for (const row of rows) {
        const { courseId, credits, grade, isRetake } = parseCourseRow(row);
        if (!courseId || isNaN(credits) || isNaN(grade)) {
            valid = false;
            continue;
        }
        if (isRetake) {
            retakeMap[courseId] = { credits, grade };
        } else if (!retakeMap[courseId]) {
            retakeMap[courseId] = { credits, grade };
        }
    }
    for (const { credits, grade } of Object.values(retakeMap)) {
        totalCredits += credits;
        totalPoints += credits * grade;
    }
    let prevCgpa = 0, prevCredits = 0;
    if (includePreviousCgpa.checked) {
        prevCgpa = parseFloat(previousCgpaInput.value) || 0;
        prevCredits = parseFloat(previousCreditsInput.value) || 0;
        if (prevCgpa < 0 || prevCgpa > 4 || prevCredits < 0) valid = false;
    }
    if (!valid || (totalCredits + prevCredits) === 0) {
        clearResults();
        return;
    }
    const cgpa = (totalPoints + (prevCgpa * prevCredits)) / (totalCredits + prevCredits);
    cgpaValue.textContent = cgpa.toFixed(2);
    gradeValue.textContent = getLetterGrade(cgpa);
    resultBox.style.display = 'block';
    cgpaDetails.style.display = 'block';
    cgpaDetails.innerHTML = includePreviousCgpa.checked
        ? `Previous CGPA: <b>${prevCgpa.toFixed(2)}</b> (${prevCredits} credits)`
        : '';
    creditDetails.style.display = 'block';
    creditDetails.innerHTML = `Total Credits: <b>${totalCredits + prevCredits}</b>`;
    resultBox.scrollIntoView({behavior:'smooth'});
};

