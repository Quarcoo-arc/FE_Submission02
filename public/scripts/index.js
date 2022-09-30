import { checkAuth, getNewToken } from "./auth.js";

//Check if there is an access token
checkAuth();

const getDashboardInfo = async () => {
  const result = await fetch("https://freddy.codesubmit.io/dashboard", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + sessionStorage.getItem("access_token"),
    },
  });

  const data = await result.json();

  console.log(data);

  if (data.msg === "Token has expired") {
    const sessionRefreshed = await getNewToken();
    if (sessionRefreshed) {
      getDashboardInfo();
    } else {
      window.location.href = "./login.html";
    }
  } else if (data.dashboard) {
  } else {
    window.location.href = "./login.html";
  }
};

getDashboardInfo();

const labels = ["January", "February", "March", "April", "May", "June"];

const data = {
  labels: labels,
  datasets: [
    {
      label: "My First dataset",
      backgroundColor: "rgb(255, 99, 132)",
      borderColor: "rgb(255, 99, 132)",
      data: [0, 10, 5, 2, 20, 30, 45],
    },
  ],
};

const config = {
  type: "bar",
  data: data,
  options: {},
};

const myChart = new Chart(document.getElementById("myChart"), config);
