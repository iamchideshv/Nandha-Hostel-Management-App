export const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    // Handle YYYY-MM-DD format
    const parts = dateString.split('-');
    if (parts.length === 3) {
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
    }
    return dateString;
};

export const formatTime = (timeString: string | undefined) => {
    if (!timeString || timeString === 'N/A') return 'N/A';
    const [hours, minutes] = timeString.split(':');
    if (!hours || !minutes) return timeString;

    let hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12; // the hour '0' should be '12'
    return `${hour.toString().padStart(2, '0')}:${minutes} ${ampm}`;
};
