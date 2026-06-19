document.addEventListener("DOMContentLoaded", function() {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = document.getElementById("searchInput");
    var results = document.getElementById("searchResults");
    var lead = document.getElementById("searchLead");
    if (input) {
        input.value = query;
    }
    if (!query || !results || !Array.isArray(siteMovieIndex)) {
        return;
    }
    var normalized = query.toLowerCase();
    var matched = siteMovieIndex.filter(function(movie) {
        var text = [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.tags, movie.oneLine, movie.category].join(" ").toLowerCase();
        return text.indexOf(normalized) !== -1;
    }).slice(0, 96);
    results.innerHTML = "";
    if (lead) {
        lead.textContent = matched.length ? "与“" + query + "”相关的影片" : "暂无匹配内容";
    }
    matched.forEach(function(movie) {
        var article = document.createElement("article");
        article.className = "movie-card";
        article.innerHTML = '<a class="poster-link" href="' + movie.url + '"><img src="' + movie.cover + '" alt=""></a>' +
            '<div class="card-body"><div class="meta-line"><span>' + movie.year + '</span><span>' + movie.region + '</span><span>' + movie.type + '</span></div>' +
            '<h3><a href="' + movie.url + '"></a></h3><p></p><div class="tag-list"><span></span><span></span></div></div>';
        article.querySelector("img").alt = movie.title;
        article.querySelector("h3 a").textContent = movie.title;
        article.querySelector("p").textContent = movie.oneLine || movie.genre;
        var tagSpans = article.querySelectorAll(".tag-list span");
        tagSpans[0].textContent = movie.category;
        tagSpans[1].textContent = movie.genre;
        results.appendChild(article);
    });
});
