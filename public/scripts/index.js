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
      await data.dashboard.sales_over_time_week[1].total
    );
    todayOrdersSpan.textContent = shortenNum(
      await data.dashboard.sales_over_time_week[1].orders
    );

    lastWeekTotalSpan.textContent = shortenNum(
      await data.dashboard.sales_over_time_week[7].total
    );
    lastWeekOrdersSpan.textContent = shortenNum(
      await data.dashboard.sales_over_time_week[7].orders
    );

    lastMonthTotalSpan.textContent = shortenNum(
      await data.dashboard.sales_over_time_year[2].total
    );
    lastMonthOrdersSpan.textContent = shortenNum(
      await data.dashboard.sales_over_time_year[2].orders
    );

    const data_values = [];
    for (const item in data.dashboard.sales_over_time_week) {
      data_values.push(data.dashboard.sales_over_time_week[item].total);
    }

    console.log(data_values);

    // Create Chart
    const labels = [
      "Today",
      "Yesterday",
      "Day 3",
      "Day 4",
      "Day 5",
      "Day 6",
      "Day 7",
    ];

    const data_set = {
      labels: labels,
      datasets: [
        {
          label: "Revenue (last 7 days)",
          backgroundColor: "rgb(255, 99, 132)",
          borderColor: "rgb(255, 99, 132)",
          data: data_values,
        },
      ],
    };

    const config = {
      type: "bar",
      data: data_set,
      options: {},
    };

    const myChart = new Chart(document.getElementById("myChart"), config);
  } else {
    window.location.href = "./login.html";
  }
};

getDashboardInfo();
