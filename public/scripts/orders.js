import { checkAuth, getNewToken } from "./auth.js";

//Check if there is an access token
checkAuth();

let CURRENT_DATA;

let SEARCH_TERM = "";

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

const checkPagination = (data) => {
  const startNum = document.getElementById("current-page");
  const endNum = document.getElementById("end-page");

  const rightArrow = document.getElementById("right");
  const leftArrow = document.getElementById("left");

  startNum.textContent = data.page;
  endNum.textContent = Math.ceil(data.total / 50);

  if (startNum.textContent === endNum.textContent) {
    rightArrow.classList.add("disabled");
  }
  if (endNum.textContent === "1") {
    leftArrow.classList.add("disabled");
    rightArrow.classList.add("disabled");
  }
  if (
    startNum.textContent !== endNum.textContent &&
    rightArrow.classList.contains("disabled")
  ) {
    rightArrow.classList.remove("disabled");
  }

  if (startNum.textContent === "1") {
    leftArrow.classList.add("disabled");
  }
  if (startNum.textContent !== "1") {
    leftArrow.classList.remove("disabled");
  }
};

const switchPages = async (direction) => {
  const endNum = Math.ceil(CURRENT_DATA.total / 50);
  if (
    (direction === "next" && CURRENT_DATA.page === endNum) ||
    (direction === "previous" && CURRENT_DATA.page === 1)
  ) {
    return;
  }
  const result = await fetchOrders(
    `https://freddy.codesubmit.io/orders?page=${
      direction === "next" ? CURRENT_DATA.page + 1 : CURRENT_DATA.page - 1
    }&q=${SEARCH_TERM}`
  );
  console.log(result);

  // If Token has expired, refresh it
  if (result.msg === "Token has expired") {
    const sessionRefreshed = await getNewToken();
    if (sessionRefreshed) {
      switchPages(CURRENT_DATA, keyword, direction);
    } else {
      window.location.href = "./login.html";
    }

    // If Token is not expired, populate orders page with relevant info
  } else if (result.orders) {
    populateTable(result.orders);
    checkPagination(result);
    CURRENT_DATA = result;
  } else {
    window.location.href = "./login.html";
  }
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
    checkPagination(data);

    // Search for specific orders

    CURRENT_DATA = data;

    const searchOrders = async (event) => {
      event.preventDefault();

      SEARCH_TERM = searchForm.searchTerm.value;

      searchForm.searchTerm.value = "";

      console.log(SEARCH_TERM);

      const data = await fetchOrders(
        `https://freddy.codesubmit.io/orders?q=${SEARCH_TERM}`
      );

      if (data.msg === "Token has expired") {
        const sessionRefreshed = await getNewToken();
        if (sessionRefreshed) {
          data = await fetchOrders(
            `https://freddy.codesubmit.io/orders?q=${SEARCH_TERM}`
          );
        } else {
          window.location.href = "./login.html";
        }

        // If Token is not expired, populate orders page with relevant info
      } else if (data.orders) {
        console.log(data);
        CURRENT_DATA = data;
        populateTable(data.orders);
        checkPagination(data);
      } else {
        window.location.href = "./login.html";
      }
    };

    const searchForm = document.getElementById("searchForm");

    searchForm.addEventListener("submit", searchOrders);

    // Switch pages

    const rightArrow = document.getElementById("right");
    const leftArrow = document.getElementById("left");

    rightArrow.addEventListener("click", switchPages.bind(null, "next"));
    leftArrow.addEventListener("click", switchPages.bind(null, "previous"));

    // If token is invalid, redirect to login page
  } else {
    window.location.href = "./login.html";
  }
};

getOrdersInfo();
