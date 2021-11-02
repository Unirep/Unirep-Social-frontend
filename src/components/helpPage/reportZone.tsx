const ReportZone = () => {
    return (
        <div className="report-zone">
            <h3>Report An Issue</h3>
            <p>Share your issue below and include your email for a direct response.</p>
            <textarea placeholder="Describe issue" name="issue" />
            <textarea placeholder="Your email (optional)" name="email" rows={1} />
            <div className="submit-btn">Submit</div>
        </div>
    )
}

export default ReportZone;