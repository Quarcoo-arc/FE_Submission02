import { checkAuth, getNewToken } from "./auth.js";

//Check if there is an access token
checkAuth();

// Load Orders Info
const getOrdersInfo = async () => {
  const result = await fetch("https://freddy.codesubmit.io/orders", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + sessionStorage.getItem("access_token"),
    },
  });

  const data = await result.json();

  console.log(data);

  // If Token has expired, refresh it
  if (data.msg === "Token has expired") {
    const sessionRefreshed = await getNewToken();
    if (sessionRefreshed) {
      getOrdersInfo();
    } else {
      window.location.href = "./login.html";
    }

    // If Token is not expired, populate orders page with relevant info
  } else if (data.orders) {
    const tableBody = document.getElementsByTagName("tbody")[0];

    let tableRows = ``;

    data.orders.forEach((order) => {
      tableRows += `
            <tr>
              <td>${order.product.name}</td>
              <td>${new Date(order.created_at).toUTCString()}</td>
              <td>${order.currency}${order.total}</td>
              <td>${order.status}</td>
            </tr>`;
    });

    tableBody.innerHTML = tableRows;

    // If token is invalid, redirect to login page
  } else {
    window.location.href = "./login.html";
  }
};

getOrdersInfo();
