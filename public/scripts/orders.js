import { checkAuth, getNewToken } from "./auth.js";

//Check if there is an access token
checkAuth();

const fetchOrders = async (url) => {
  const result = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + sessionStorage.getItem("access_token"),
    },
  });

  const data = await result.json();

  return data;
};

const populateTable = (data) => {
  const tableBody = document.getElementsByTagName("tbody")[0];

  let tableRows = ``;

  data.forEach((order) => {
    tableRows += `
            <tr>
              <td>${order.product.name}</td>
              <td>${new Date(order.created_at).toUTCString()}</td>
              <td>${order.currency}${order.total}</td>
              <td class="${
                order.status === "processing"
                  ? "text-red"
                  : order.status === "delivered"
                  ? "text-green"
                  : ""
              }">${
      order.status.charAt(0).toUpperCase() + order.status.slice(1)
    }</td>
            </tr>`;
  });

  tableBody.innerHTML = tableRows;
};

// Load Orders Info
const getOrdersInfo = async () => {
  const data = await fetchOrders("https://freddy.codesubmit.io/orders");

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
    populateTable(data.orders);

    // Search for specific orders

    const searchOrders = async (event) => {
      event.preventDefault();

      const keyword = searchForm.searchTerm.value;

      searchForm.searchTerm.value = "";

      console.log(keyword);

      const data = await fetchOrders(
        `https://freddy.codesubmit.io/orders?q=${keyword}`
      );

      if (data.msg === "Token has expired") {
        const sessionRefreshed = await getNewToken();
        if (sessionRefreshed) {
          data = await fetchOrders(
            `https://freddy.codesubmit.io/orders?q=${keyword}`
          );
        } else {
          window.location.href = "./login.html";
        }

        // If Token is not expired, populate orders page with relevant info
      } else if (data.orders) {
        console.log(data);
        populateTable(data.orders);
      } else {
        window.location.href = "./login.html";
      }
    };

    const searchForm = document.getElementById("searchForm");

    searchForm.addEventListener("submit", searchOrders);
    // If token is invalid, redirect to login page
  } else {
    window.location.href = "./login.html";
  }
};

getOrdersInfo();
