document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('projectForm');
    const scriptURL = 'https://script.google.com/macros/s/AKfycbwTLUMVVCXCoaTT272zdjjWgXy7TcAKKe1WT5K6BiJMlGPHII67RTKhxloV8fu2u8Nr/exec'; // Replace with your URL
    const projectTypeRadios = document.querySelectorAll('input[name="projectType"]');
    const projectNameGroup = document.getElementById('projectNameGroup');
    const selectProjectGroup = document.getElementById('selectProjectGroup');
    const webOther = document.getElementById('webOther');
    const otherWebTechGroup = document.getElementById('otherWebTechGroup');
    const designOptionsRadios = document.querySelectorAll('input[name="designOptions"]');
    const iterationsGroup = document.getElementById('iterationsGroup');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    // Conditional fields for Project Type
    projectTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'Presales') {
                projectNameGroup.style.display = 'block';
                selectProjectGroup.style.display = 'none';
                document.getElementById('projectName').required = true;
                document.getElementById('selectedProject').required = false;
            } else if (this.value === 'Post Sales') {
                projectNameGroup.style.display = 'none';
                selectProjectGroup.style.display = 'block';
                document.getElementById('projectName').required = false;
                document.getElementById('selectedProject').required = true;
            }
        });
    });

    // Other Web Tech
    webOther.addEventListener('change', function() {
        otherWebTechGroup.style.display = this.checked ? 'block' : 'none';
        document.getElementById('otherWebTech').required = this.checked;
    });

    // Design Options for Iterations
    designOptionsRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            iterationsGroup.style.display = (this.value === 'Required') ? 'block' : 'none';
            document.getElementById('iterations').required = (this.value === 'Required');
        });
    });

    // Date validation
    const today = new Date().toISOString().split('T')[0];
    startDateInput.min = today;
    endDateInput.min = today;

    startDateInput.addEventListener('change', function() {
        if (this.value < today) {
            this.value = '';
            alert('Start date cannot be in the past');
        }
        endDateInput.min = this.value;
    });

    endDateInput.addEventListener('change', function() {
        if (startDateInput.value && this.value < startDateInput.value) {
            this.value = '';
            alert('End date must be after start date');
        }
    });

    // Submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Custom validations
        const projectType = form.querySelector('input[name="projectType"]:checked')?.value;
        if (!projectType) return alert('Select Project Type');
        if (projectType === 'Presales' && !form.projectName.value.trim()) return alert('Enter Project Name');
        if (projectType === 'Post Sales' && !form.selectedProject.value) return alert('Select a Project');
        if (!form.querySelector('input[name="deliverables"]:checked')) return alert('Select at least one Deliverable');
        if (!form.querySelector('input[name="webTech"]:checked')) return alert('Select at least one Web Tech Stack');
        if (webOther.checked && !form.otherWebTech.value.trim()) return alert('Specify Other Web Tech');
        if (!form.querySelector('input[name="designOptions"]:checked')) return alert('Select Design Options');
        if (form.designOptions.value === 'Required' && !form.iterations.value) return alert('Select No. of Iterations');

        // Collect data
        const formData = new FormData(form);
        const data = {};
        const deliverables = [];
        const webTech = [];

        formData.forEach((value, key) => {
            if (key === 'deliverables') deliverables.push(value);
            else if (key === 'webTech') webTech.push(value);
            else data[key] = value;
        });

        data.deliverables = deliverables;
        data.webTech = webTech.filter(t => t !== 'Other'); // Exclude 'Other' if checked, as it's in otherWebTech

        // POST
        fetch(scriptURL, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(res => res.json())
        .then(result => {
            if (result.result === 'success') {
                alert('Submitted! Row: ' + result.row);
                form.reset();
                // Reset displays
                projectNameGroup.style.display = 'none';
                selectProjectGroup.style.display = 'none';
                otherWebTechGroup.style.display = 'none';
                iterationsGroup.style.display = 'none';
            } else {
                alert('Error: ' + result.error);
            }
        })
        .catch(err => alert('Network error: ' + err));
    });
});