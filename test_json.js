async function run() {
  try {
    const res = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'johndoe', password: 'password123' })
    })
    console.log("res.ok", res.ok)
    const data = await res.json()
    console.log("data", data)
    if (!res.ok) {
        console.log("Setting error", data.error || 'Registration failed.')
        return
    }
    console.log("Success")
  } catch (err) {
    console.log("Caught error", err.message)
  }
}
run()
