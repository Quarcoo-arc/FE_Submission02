const checkAuth = () => {
  if (!sessionStorage.getItem("access_token")) {
    window.location.href = "./login.html";
  }
};

const getNewToken = async () => {
  const result = await fetch("https://freddy.codesubmit.io/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + sessionStorage.getItem("refresh_token"),
    },
  });
  const data = await result.json();

  if (data.access_token) {
    sessionStorage.setItem("access_token", data.access_token);
    return true;
  } else {
    return false;
  }
};

export { checkAuth, getNewToken };
