export default function Home() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Simplr API</h1>
      <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>Backend API Service</p>
      
      <div style={{ maxWidth: '600px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Available Endpoints</h2>
        <ul style={{ textAlign: 'left', lineHeight: '2' }}>
          <li><code>/api/auth/*</code> - Authentication (login, register, logout, refresh, me)</li>
          <li><code>/api/expenses</code> - Expense management</li>
          <li><code>/api/habits</code> - Habit tracking</li>
          <li><code>/api/habit-logs</code> - Habit logs</li>
          <li><code>/api/notes</code> - Note management</li>
          <li><code>/api/reminders</code> - Reminder management</li>
          <li><code>/api/reminder-lists</code> - Reminder lists</li>
        </ul>
      </div>

      <p style={{ marginTop: '2rem', color: '#999', fontSize: '0.9rem' }}>
        API Status: <span style={{ color: '#22c55e', fontWeight: 'bold' }}>Active</span>
      </p>
    </div>
  );
}

