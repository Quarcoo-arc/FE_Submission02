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

  if (data.access_token) {
    sessionStorage.setItem("access_token", data.access_token);
    sessionStorage.setItem("refresh_token", data.refresh_token);
    window.location.href = "./index.html";
  } else if (data.msg) {
    alert(data.msg);
  } else {
    alert("Something went wrong");
  }
};

loginForm.addEventListener("submit", handleSubmit);
