const loginForm = document.getElementById("form-login");

const handleSubmit = async (event) => {
  event.preventDefault();
  console.log(loginForm.username.value);

  const payload = {
    username: loginForm.username.value,
    password: loginForm.password.value,
  };

  const result = await fetch("https://freddy.codesubmit.io/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await result.json();

  console.log(data);
};

loginForm.addEventListener("submit", handleSubmit);
