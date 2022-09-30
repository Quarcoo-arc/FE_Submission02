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

  const shortenNum = (num) => {
    if (num >= 1000000) {
      return `${Math.floor(num / 1000000)}M`;
    } else if (num >= 1000) {
      return `${Math.floor(num / 1000)}K`;
    } else {
      return num;
    }
  };

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
    // Update Dashboard Information
    const todayTotalSpan = document.getElementById("today-total");
    const lastWeekTotalSpan = document.getElementById("last-week-total");
    const lastMonthTotalSpan = document.getElementById("last-month-total");

    const todayOrdersSpan = document.getElementById("today-orders");
    const lastWeekOrdersSpan = document.getElementById("last-week-orders");
    const lastMonthOrdersSpan = document.getElementById("last-month-orders");

    todayTotalSpan.textContent = shortenNum(
      data.dashboard.sales_over_time_week[1].total
    );
    todayOrdersSpan.textContent = shortenNum(
      data.dashboard.sales_over_time_week[1].orders
    );

    lastWeekTotalSpan.textContent = shortenNum(
      data.dashboard.sales_over_time_week[7].total
    );
    lastWeekOrdersSpan.textContent = shortenNum(
      data.dashboard.sales_over_time_week[7].orders
    );

    lastMonthTotalSpan.textContent = shortenNum(
      data.dashboard.sales_over_time_year[2].total
    );
    lastMonthOrdersSpan.textContent = shortenNum(
      data.dashboard.sales_over_time_year[2].orders
    );

    // Create Chart
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
