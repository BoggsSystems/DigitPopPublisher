const digitPop = (() => {
  let config = {};

  // Spinner logic
  const showSpinner = () => {
    const spinner = document.createElement("div");
    spinner.id = "busy-spinner";
    spinner.style.position = "fixed";
    spinner.style.top = "50%";
    spinner.style.left = "50%";
    spinner.style.transform = "translate(-50%, -50%)";
    spinner.style.zIndex = "1001";
    spinner.innerHTML = '<div class="loader"></div>';
    document.body.appendChild(spinner);
  };

  const hideSpinner = () => {
    const spinner = document.getElementById("busy-spinner");
    if (spinner) spinner.remove();
  };

  const storeToken = (token) => {
    localStorage.setItem("digitPopToken", token);
    console.log("Stored token:", token); // DEBUG STATEMENT
  };

  const getToken = () => {
    const token = localStorage.getItem("digitPopToken");
    console.log("Retrieved token from storage:", token); // DEBUG STATEMENT
    return token;
  };

  const clearToken = () => {
    localStorage.removeItem("digitPopToken");
  };

  const createLoginPanel = () => {
    if (document.getElementById("login-panel")) return;

    const overlay = document.createElement("div");
    overlay.id = "login-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.right = "0";
    overlay.style.bottom = "0";
    overlay.style.left = "0";
    overlay.style.zIndex = "9999";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
    document.body.appendChild(overlay);

    const loginPanel = document.createElement("div");
    loginPanel.id = "login-panel";
    loginPanel.style.position = "fixed";
    loginPanel.style.top = "50%";
    loginPanel.style.left = "50%";
    loginPanel.style.transform = "translate(-50%, -50%)";
    loginPanel.style.backgroundColor = "#ffffff";
    loginPanel.style.padding = "20px";
    loginPanel.style.borderRadius = "5px";
    loginPanel.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
    loginPanel.style.zIndex = "9999";
    loginPanel.innerHTML = `
        <button id="close-panel" style="position: absolute; right: 5px; top: 5px; background: none; border: none; font-size: 24px;">&times;</button>
        <h1 style="color: #424242;">DigitPop SSO</h1>
        <input type="text" id="username" placeholder="Enter your username" style="padding: 10px; border: 1px solid #BDBDBD; width: 100%; border-radius: 4px; margin-bottom: 10px;">
        <input type="password" id="password" placeholder="Enter your password" style="padding: 10px; border: 1px solid #BDBDBD; width: 100%; border-radius: 4px; margin-bottom: 10px;">
        <button id="signin" onclick="digitPop.authenticate()" style="padding: 10px 20px; background-color: #EC407A; border: none; border-radius: 4px; color: #ffffff; cursor: pointer; font-weight: bold;">Sign in</button>
        <div id="asset-price" style="margin-top: 20px; color: #616161;">Asset Price: N/A Pop-Coins</div>
        <div id="feedback" style="margin-top: 10px; color: #E57373;"></div>
    `;

    overlay.appendChild(loginPanel);

    document.getElementById("close-panel").addEventListener("click", () => {
      overlay.remove();
    });
  };

  const injectButton = (assetId) => {
    // Assuming there's a static projectId defined somewhere in the library
    const adId = "647fe920a40f14000259e37b"; // Replace with the actual static project ID

    // Create the button element
    config.assetId = assetId;
    const btn = document.createElement("button");
    btn.innerText = "Access with DigitPop";
    btn.id = "digitpop-access-btn";
    btn.style.padding = "10px 20px";
    btn.style.backgroundColor = "#EC407A";
    btn.style.border = "none";
    btn.style.borderRadius = "4px";
    btn.style.color = "#ffffff";
    btn.style.cursor = "pointer";
    btn.style.fontWeight = "bold";
    // ... other button setup ...

    // Append button to the body
    document.body.appendChild(btn);

    // Add click event listener to the button
    btn.addEventListener("click", () => {
      // Call the createEngagementFromPlayer function with the assetId and projectId
      createEngagementFromPlayer(projectId)
        .then((data) => {
          if (data && data.engagementId && data.campaignId) {
            // If engagement is successfully created, pass the IDs to launch the player in a modal
            launchPlayerInModal(data.engagementId, data.campaignId, projectId);
          } else {
            // Handle the error case where the necessary data isn't returned
            console.error(
              "Engagement creation did not return the expected data."
            );
          }
        })
        .catch((error) => {
          console.error("Error creating engagement:", error);
        });
    });
  };

  const authenticate = async function (username, password, assetId) {
    showSpinner();
    const existingToken = getToken();
    if (existingToken) {
      const isValid = await checkTokenValidity(existingToken);
      console.log("Is existing token valid?:", isValid); // DEBUG STATEMENT

      if (isValid) {
        return { status: "success", token: existingToken };
      } else {
        clearToken(); // Clear the invalid token
      }
    }

    const usernameElem = document.getElementById("username");
    const passwordElem = document.getElementById("password");
    username = usernameElem.value;
    password = passwordElem.value;

    let userAuthResponse = await fetch(
      "https://digitpop-identity-provider.azurewebsites.net/api/UserAuthentication?code=CaWDASjqkegB_-4ah_lxafjn0YKxW-ElaqLYvvD_BYcAAzFuv4ryUw==",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      }
    );

    let authData = await userAuthResponse.json();
    console.log("Auth data:", authData);

    if (userAuthResponse.status !== 200) {
      document.getElementById("feedback").innerText =
        "Authentication failed. Reason: " + authData.message;
      return;
    }

    let accessToken = authData.token;
    console.log("Collected access token:", accessToken); // DEBUG STATEMENT

    const requestBody = {
      token: accessToken,
      assetId: config.assetId,
    };
    console.log(
      "Sending request body to TokenEndpoint:",
      JSON.stringify(requestBody)
    ); // DEBUG STATEMENT

    console.log("config.assetId is : " + config.assetId);
    let tokenValidationResponse = await fetch(
      "https://digitpop-identity-provider.azurewebsites.net/api/TokenEndpoint?code=aWu3a43UFlriH8tcPeQq-PTMkdN15p18MjkxG89XENziAzFuC1RcpA==",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!tokenValidationResponse.ok) {
      console.log("DEBUG: Token validation response:", tokenValidationResponse);
      console.error(
        "Server responded with an error:",
        tokenValidationResponse.statusText
      );
      return;
    }

    if (tokenValidationResponse.status != 200) {
      console.log("DEBUG: Token validation response:", tokenValidationResponse);
      const errorText = await tokenValidationResponse.text();
      console.error("Server returned an error:", errorText);
      hideSpinner();
      // Handle the error message in your UI, e.g., show it to the user
      document.getElementById("feedback").innerText =
        "Authentication error: " + errorText;
      return { status: "error", message: errorText };
    }

    let tokenData;
    try {
      console.log("DEBUG: Token validation response:", tokenValidationResponse);
      tokenData = await tokenValidationResponse.json();
    } catch (error) {
      //console.log("DEBUG: Token validation response:", tokenValidationResponse);
      console.log("Error parsing JSON response:" + error);
      // Handle the error or return from the function
      return;
    }

    console.log("Token data response:", tokenData);

    let assetPrice = tokenData.asset_price;

    // Publisher authentication
    let publisherResponse = await fetch(
      "https://digitpop-identity-provider.azurewebsites.net/api/PublisherTest?code=-NVBfPfXbSSdf3Mk1M9oLRIgMHq1LYgFpeTzX8FBxTaSAzFuf0NwXQ==",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + tokenData.access_token,
        },
      }
    );

    if (publisherResponse.status != 200) {
      return { status: "error", message: "Publisher authentication failed." };
    }

    storeToken(accessToken);

    hideSpinner();

    return { status: "success", assetPrice: assetPrice, token: accessToken };
  };

  const confirmPurchase = async function (username, token) {
    // Make a call to the Purchase endpoint
    let purchaseResponse = await fetch(
      "https://digitpop-identity-provider.azurewebsites.net/api/PurchaseAsset?code=purchaseAssetFunctionCode",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          username: username,
          assetId: config.assetId,
        }),
      }
    );

    let purchaseData = await purchaseResponse.json();

    if (purchaseResponse.status != 200) {
      // Purchase failed
      return { status: "error", message: "Purchase failed." };
    }

    // Purchase successful
    return {
      status: "success",
      remainingBalance: purchaseData.remaining_balance,
    };
  };

  async function fetchAssetPrice() {
    try {
      showSpinner();

      let response = await fetch(
        "https://digitpop-identity-provider.azurewebsites.net/api/AssetPrice?code=5HKyJy1RSWieQymjw_wtw4M20J-n0YRq_gFD4r7L_rCsAzFuFNJNhA==",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            assetId: config.assetId,
          }),
        }
      );

      if (response.status !== 200) {
        document.getElementById("feedback").innerText =
          "Asset fetch failed. Reason: " + authData.message;
        return;
      }

      if (response.ok) {
        let assetPrice = await response.text(); // Get the asset price as text

        // Convert the asset price to a number, if necessary
        assetPrice = parseFloat(assetPrice);

        // Assuming you have an HTML element with the id 'asset-price'
        document.getElementById(
          "asset-price"
        ).innerText = `Asset Price: ${assetPrice}`;

        hideSpinner();
        return assetPrice;
      } else {
        hideSpinner();
        console.log(
          "Error fetching asset price:",
          response.status,
          response.statusText
        );
        return null;
      }
    } catch (err) {
      hideSpinner();
      console.log("Error fetching asset price:", err);
      return null;
    }
  }

  const checkTokenValidity = async (token) => {
    let validationResponse = await fetch(
      "https://digitpop-identity-provider.azurewebsites.net/api/TokenEndpoint?code=aWu3a43UFlriH8tcPeQq-PTMkdN15p18MjkxG89XENziAzFuC1RcpA==",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          token: token,
          assetId: config.assetId,
        }),
      }
    );

    return validationResponse.status === 200;
  };

  function createEngagementFromPlayer(adId) {
    const apiUrl = "YOUR_API_URL"; // Replace with your actual API URL
    const endpoint = `${apiUrl}/api/engagement/createWithoutUser`; // Updated endpoint
    const postData = JSON.stringify({
      projectId: adId,
    });

    return fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add any other headers required for authentication, etc.
      },
      body: postData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .catch((error) => {
        console.error("There was an error creating the engagement:", error);
      });
  }

  function launchPlayerInModal(projectId, engagementId, campaignId) {
    // Create the modal overlay that fills the screen
    const modalOverlay = document.createElement("div");
    modalOverlay.style.position = "fixed";
    modalOverlay.style.top = "0";
    modalOverlay.style.left = "0";
    modalOverlay.style.width = "100%";
    modalOverlay.style.height = "100%";
    modalOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    modalOverlay.style.zIndex = "1000";
    modalOverlay.style.display = "flex";
    modalOverlay.style.justifyContent = "center";
    modalOverlay.style.alignItems = "center";

    // Create the container for the player
    const playerContainer = document.createElement("div");
    playerContainer.style.width = "80%"; // Adjust size as needed
    playerContainer.style.height = "80%"; // Adjust size as needed
    playerContainer.style.backgroundColor = "#fff"; // Or any other background color

    // Create the iframe for the DigitPop player
    const playerIframe = document.createElement("iframe");
    playerIframe.style.width = "100%";
    playerIframe.style.height = "100%";
    playerIframe.frameBorder = "0";
    playerIframe.src = `http://localhost:4201/ad/${projectId}/engagement/${engagementId}/campaign/${campaignId}`; // Replace with the actual URL of the player

    // Append the iframe to the container
    playerContainer.appendChild(playerIframe);

    // Append the player container to the modal overlay
    modalOverlay.appendChild(playerContainer);

    // Append the modal overlay to the body
    document.body.appendChild(modalOverlay);

    // Add a click event listener to close the modal
    modalOverlay.addEventListener("click", function (event) {
      if (event.target === modalOverlay) {
        modalOverlay.remove();
      }
    });

    // Optional: Add a close button inside the player container for better UX
    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.style.position = "absolute";
    closeButton.style.top = "10px";
    closeButton.style.right = "10px";
    closeButton.style.zIndex = "1001";

    // Close button event listener
    closeButton.addEventListener("click", function () {
      modalOverlay.remove();
    });

    // Append the close button to the player container
    playerContainer.appendChild(closeButton);
  }

  return {
    authenticate,
    confirmPurchase,
    injectButton,
  };
})();
