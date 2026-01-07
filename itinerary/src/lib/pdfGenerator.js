import jsPDF from 'jspdf';

export const downloadItineraryPDF = (tripData, itinerary, hotels) => {
    const doc = new jsPDF();
    const marginLeft = 20;
    let yPos = 20;

    // Title
    doc.setFontSize(22);
    doc.setTextColor(41, 128, 185); // Blue
    doc.text(`Trip to ${tripData.destination}`, marginLeft, yPos);
    yPos += 10;

    // Overview
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Duration: ${itinerary.duration}`, marginLeft, yPos);
    yPos += 6;
    doc.text(`Travelers: ${tripData.travelers} (${tripData.tripType})`, marginLeft, yPos);
    yPos += 6;
    doc.text(`Budget: ${tripData.budget}`, marginLeft, yPos);
    yPos += 15;

    // Itinerary
    doc.setFontSize(16);
    doc.setTextColor(41, 128, 185);
    doc.text("Day-wise Itinerary", marginLeft, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    itinerary.days.forEach((day, index) => {
        // Check page break
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFont(undefined, 'bold');
        doc.text(`Day ${day.day}: ${day.theme}`, marginLeft, yPos);
        yPos += 7;

        doc.setFont(undefined, 'normal');
        day.plan.forEach((activity) => {
            if (yPos > 280) {
                doc.addPage();
                yPos = 20;
            }
            doc.text(`• ${activity.time}: ${activity.title}`, marginLeft + 5, yPos);
            yPos += 6;
        });
        yPos += 5;
    });

    yPos += 10;

    // Hotels
    if (hotels) {
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }
        doc.setFontSize(16);
        doc.setTextColor(41, 128, 185);
        doc.text("Hotel Recommendations", marginLeft, yPos);
        yPos += 10;

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);

        ['Normal', 'Good', 'Premium'].forEach(category => {
            const hotel = hotels[category];
            if (hotel) {
                doc.setFont(undefined, 'bold');
                doc.text(`${category} Option:`, marginLeft, yPos);
                yPos += 6;
                doc.setFont(undefined, 'normal');
                doc.text(`Name: ${hotel.name} (${hotel.rating} stars)`, marginLeft + 5, yPos);
                yPos += 6;
                doc.text(`Price: ${hotel.price}`, marginLeft + 5, yPos);
                yPos += 10;
            }
        });
    }

    doc.save(`${tripData.destination}_Itinerary.pdf`);
};
