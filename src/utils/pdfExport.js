import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateAssessmentPDF = (userData, gameStats, riskData, llmAnalysis) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Helper function to add new page if needed
    const checkPageBreak = (requiredSpace = 40) => {
        if (yPosition + requiredSpace > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
            return true;
        }
        return false;
    };

    // Title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text('Learning Assessment Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Header line
    doc.setLineWidth(0.5);
    doc.setDrawColor(59, 130, 246);
    doc.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 10;

    // Student Information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    doc.text(`Student Name: ${userData.name}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Age: ${userData.age} years`, 20, yPosition);
    yPosition += 7;
    doc.text(`Assessment Date: ${new Date().toLocaleDateString()}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Assessment Time: ${new Date().toLocaleTimeString()}`, 20, yPosition);
    yPosition += 15;

    // Risk Assessment Summary
    checkPageBreak(60);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text('Risk Assessment Summary', 20, yPosition);
    yPosition += 10;

    // Create risk table
    const riskTableData = [
        ['Dyslexia', `${riskData.dyslexia}%`, getRiskLevel(riskData.dyslexia)],
        ['Dyscalculia', `${riskData.dyscalculia}%`, getRiskLevel(riskData.dyscalculia)],
        ['Dysgraphia', `${riskData.dysgraphia}%`, getRiskLevel(riskData.dysgraphia)],
        ['ADHD', `${riskData.adhd}%`, getRiskLevel(riskData.adhd)]
    ];

    doc.autoTable({
        startY: yPosition,
        head: [['Learning Area', 'Risk Score', 'Risk Level']],
        body: riskTableData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 5 },
        columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 40, halign: 'center' },
            2: { cellWidth: 50, halign: 'center' }
        },
        didDrawCell: (data) => {
            if (data.section === 'body' && data.column.index === 2) {
                const riskLevel = data.cell.text[0];
                if (riskLevel === 'High') {
                    doc.setFillColor(239, 68, 68);
                } else if (riskLevel === 'Medium') {
                    doc.setFillColor(245, 158, 11);
                } else {
                    doc.setFillColor(34, 197, 94);
                }
                doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
                doc.setTextColor(255, 255, 255);
                doc.text(riskLevel, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2, {
                    align: 'center',
                    baseline: 'middle'
                });
            }
        }
    });

    yPosition = doc.lastAutoTable.finalY + 15;

    // Game Performance
    checkPageBreak(60);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text('Individual Game Performance', 20, yPosition);
    yPosition += 10;

    const gameTableData = Object.entries(gameStats)
        .filter(([name]) => name !== 'questionnaire')
        .filter(([, stats]) => stats.played)
        .map(([name, stats]) => [
            formatGameName(name),
            stats.score,
            stats.grade || 'N/A',
            `${stats.correct || 0}/${(stats.correct || 0) + (stats.incorrect || 0)}`
        ]);

    doc.autoTable({
        startY: yPosition,
        head: [['Game', 'Score', 'Grade', 'Accuracy']],
        body: gameTableData,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 4 }
    });

    yPosition = doc.lastAutoTable.finalY + 15;

    // LLM Analysis Insights
    if (llmAnalysis) {
        checkPageBreak(80);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(31, 41, 55);
        doc.text('AI-Generated Insights', 20, yPosition);
        yPosition += 10;

        // Critical Findings
        if (llmAnalysis.criticalFindings && llmAnalysis.criticalFindings.length > 0) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(239, 68, 68);
            doc.text('Key Observations:', 20, yPosition);
            yPosition += 7;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(75, 85, 99);

            llmAnalysis.criticalFindings.forEach((finding, idx) => {
                checkPageBreak(15);
                const lines = doc.splitTextToSize(`${idx + 1}. ${finding}`, pageWidth - 40);
                doc.text(lines, 25, yPosition);
                yPosition += lines.length * 5 + 3;
            });

            yPosition += 5;
        }

        // Recommendations
        if (llmAnalysis.recommendations && llmAnalysis.recommendations.length > 0) {
            checkPageBreak(40);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(34, 197, 94);
            doc.text('Recommendations:', 20, yPosition);
            yPosition += 7;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(75, 85, 99);

            llmAnalysis.recommendations.forEach((rec, idx) => {
                checkPageBreak(15);
                const lines = doc.splitTextToSize(`${idx + 1}. ${rec}`, pageWidth - 40);
                doc.text(lines, 25, yPosition);
                yPosition += lines.length * 5 + 3;
            });
        }
    }

    // Game-by-Game Analysis
    if (llmAnalysis && llmAnalysis.gameAnalysis) {
        doc.addPage();
        yPosition = 20;

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(31, 41, 55);
        doc.text('Detailed Game Analysis', 20, yPosition);
        yPosition += 10;

        Object.entries(llmAnalysis.gameAnalysis).forEach(([gameName, analysis]) => {
            checkPageBreak(30);
            
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(59, 130, 246);
            doc.text(formatGameName(gameName), 20, yPosition);
            yPosition += 7;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(75, 85, 99);
            
            const reasoningLines = doc.splitTextToSize(analysis.reasoning, pageWidth - 40);
            doc.text(reasoningLines, 25, yPosition);
            yPosition += reasoningLines.length * 5 + 5;

            if (analysis.keyIndicators && analysis.keyIndicators.length > 0) {
                doc.setFont('helvetica', 'italic');
                doc.text(`Key Indicators: ${analysis.keyIndicators.join(', ')}`, 25, yPosition);
                yPosition += 10;
            }
        });
    }

    // Disclaimer
    doc.addPage();
    yPosition = 20;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(245, 158, 11);
    doc.text('Important Disclaimer', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(75, 85, 99);
    const disclaimerText = `This assessment is a screening tool designed for educational purposes only and does not constitute a medical or clinical diagnosis. The confidence scores (max 80%) reflect the system's analytical limitations. For accurate diagnosis and intervention, please consult with qualified healthcare professionals including educational psychologists, pediatricians, or learning specialists.

This report is generated by an AI-assisted cognitive assessment system and should be interpreted by qualified professionals in conjunction with other diagnostic tools and clinical observations.

Assessment Methodology:
- Game-based cognitive tasks measuring various learning domains
- Real-time emotion tracking during task performance
- Response time and accuracy analysis
- AI-powered pattern recognition and risk assessment

For questions or concerns about this assessment, please consult with your child's educational team or healthcare provider.`;

    const disclaimerLines = doc.splitTextToSize(disclaimerText, pageWidth - 40);
    doc.text(disclaimerLines, 20, yPosition);

    // Footer on all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text('Generated by Mind Reader Assessment System', pageWidth - 20, pageHeight - 10, { align: 'right' });
    }

    // Save the PDF
    const fileName = `${userData.name.replace(/\s+/g, '_')}_Assessment_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
};

function getRiskLevel(score) {
    if (score >= 50) return 'High';
    if (score >= 25) return 'Medium';
    return 'Low';
}

function formatGameName(name) {
    return name.replace(/([A-Z])/g, ' $1').trim();
}
