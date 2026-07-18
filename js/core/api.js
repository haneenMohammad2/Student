fetch("https://dummyjson.com/quotes/random")
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        document.getElementById("quote").innerHTML =
            `"${data.quote}"`;

        document.getElementById("quoteAuthor").innerHTML =
            `— ${data.author}`;
    })
    .catch(function () {
        document.getElementById("quote").innerHTML =
            "Keep learning and believe in yourself.";

        document.getElementById("quoteAuthor").innerHTML = "";
    });