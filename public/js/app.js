document.addEventListener('submit', async function (event) {
    // Prevent form from submitting to the server
    event.preventDefault();

    const data = new FormData(event.target);
    const formData = Object.fromEntries(data.entries());

    const response = await fetch('/api/dependencies/' + formData["package-name"])
    const dependencyResponse = await response.json();
    console.log(dependencyResponse)

    

});
