document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const uploadBtn = document.getElementById('uploadBtn');
    const spinner = uploadBtn.querySelector('.spinner-border');
    const uploadSection = document.getElementById('uploadSection');
    const resultSection = document.getElementById('resultSection');
    const testCasesDiv = document.getElementById('testCases');
    const downloadBtn = document.getElementById('downloadBtn');
    const newUploadBtn = document.getElementById('newUploadBtn');
    const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
    const errorMessage = document.getElementById('errorMessage');

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(uploadForm);
        const fileInput = document.getElementById('qa_brd');
        
        // Validate file
        if (!fileInput.files[0]) {
            showError('Please select a file to upload');
            return;
        }

        // Validate file type
        const fileName = fileInput.files[0].name;
        if (!fileName.toLowerCase().endsWith('.doc') && !fileName.toLowerCase().endsWith('.docx')) {
            showError('Please upload a .doc or .docx file');
            return;
        }

        // Show loading state
        uploadBtn.disabled = true;
        spinner.classList.remove('d-none');
        
        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.details || 'Failed to process document');
            }

            if (data.success) {
                // Display test cases in table format
                displayTestCases(data.testCases);
                uploadSection.classList.add('d-none');
                resultSection.classList.remove('d-none');
            } else {
                throw new Error(data.error || 'Failed to process document');
            }
        } catch (error) {
            showError(error.message);
        } finally {
            // Reset loading state
            uploadBtn.disabled = false;
            spinner.classList.add('d-none');
        }
    });

    function displayTestCases(testCases) {
        // Split the test cases into lines
        const lines = testCases.split('\n');
        
        // Create table HTML
        let tableHtml = '<table class="test-cases-table">';
        
        // Add header row with proper formatting
        const headers = lines[0].split('|').filter(col => col.trim());
        tableHtml += '<thead><tr>';
        headers.forEach(header => {
            tableHtml += `<th>${header.trim()}</th>`;
        });
        tableHtml += '</tr></thead><tbody>';
        
        // Add data rows with proper formatting
        for (let i = 2; i < lines.length; i++) {
            if (lines[i].trim()) {
                // Split the line into columns
                const columns = lines[i].split('|').filter(col => col.trim());
                if (columns.length >= 7) {
                    // Format the row with proper styling
                    tableHtml += `<tr>
                        <td>${columns[0].trim()}</td>
                        <td>${columns[1].trim()}</td>
                        <td>${columns[2].trim()}</td>
                        <td class="test-steps">${formatSteps(columns[3].trim())}</td>
                        <td class="expected-results">${formatResults(columns[4].trim())}</td>
                        <td class="priority-${columns[5].trim().toLowerCase()}">${columns[5].trim()}</td>
                        <td class="status-${columns[6].trim().toLowerCase().replace(' ', '-')}">${columns[6].trim()}</td>
                    </tr>`;
                }
            }
        }
        
        tableHtml += '</tbody></table>';
        
        // Display the table
        testCasesDiv.innerHTML = tableHtml;
    }

    function formatSteps(steps) {
        // Remove duplicate numbering and format steps
        return `<ol>${steps.split('<br>').map(step => {
            // Remove leading numbers (e.g., "1. ", "2. ")
            const cleanStep = step.replace(/^\d+\.\s*/, '');
            return `<li>${cleanStep}</li>`;
        }).join('')}</ol>`;
    }

    function formatResults(results) {
        // Remove bullet points and format results
        return `<ul>${results.split('<br>').map(result => {
            // Remove leading bullet points if they exist
            const cleanResult = result.replace(/^[•\-*]\s*/, '');
            return `<li>${cleanResult}</li>`;
        }).join('')}</ul>`;
    }

    downloadBtn.addEventListener('click', () => {
        // Get table data
        const table = document.querySelector('.test-cases-table');
        const data = [];
        
        // Get headers
        const headers = [];
        table.querySelectorAll('thead th').forEach(header => {
            headers.push(header.textContent.trim());
        });
        data.push(headers);
        
        // Get row data
        table.querySelectorAll('tbody tr').forEach(row => {
            const rowData = [];
            
            // Process each cell
            row.querySelectorAll('td').forEach((cell, index) => {
                let cellContent = '';
                
                if (index === 3) { // Test Steps
                    // Get numbered list items
                    const steps = Array.from(cell.querySelectorAll('li')).map(
                        (li, i) => `${i + 1}. ${li.textContent.trim()}`
                    );
                    cellContent = steps.join('\n');
                } else if (index === 4) { // Expected Results
                    // Get bullet points
                    const results = Array.from(cell.querySelectorAll('li')).map(
                        li => `• ${li.textContent.trim()}`
                    );
                    cellContent = results.join('\n');
                } else {
                    cellContent = cell.textContent.trim();
                }
                
                rowData.push(cellContent);
            });
            
            data.push(rowData);
        });
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);
        
        // Set column widths
        const colWidths = [
            { wch: 10 },  // Test Case ID
            { wch: 20 },  // Title
            { wch: 30 },  // Test Scenario
            { wch: 40 },  // Test Steps
            { wch: 40 },  // Expected Results
            { wch: 10 },  // Priority
            { wch: 15 }   // Status
        ];
        ws['!cols'] = colWidths;
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Test Cases');
        
        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `Test_Cases_${timestamp}.xlsx`;
        
        // Trigger download
        XLSX.writeFile(wb, filename);
    });

    newUploadBtn.addEventListener('click', () => {
        // Reset form
        uploadForm.reset();
        
        // Switch views
        resultSection.classList.add('d-none');
        uploadSection.classList.remove('d-none');
        
        // Reset test cases
        testCasesDiv.innerHTML = '';
    });

    function showError(message) {
        errorMessage.textContent = message;
        errorModal.show();
    }
}); 