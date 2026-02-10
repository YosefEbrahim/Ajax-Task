const API_Link = "http://localhost:8000";
const Search_Resume_Path = "/search-resumes";
const Search_Query_Path = "/search-query";
const Resume_Rank_Path = "/rank-resumes"

// Text Search
$('#btnResumeSearch').on("click", function ()
{
    const text = $("#resumeSearchText").val().trim();
    const limitVar = $("#resumeSearchLimit").val().trim();

    if(!text) {
        $("#resumeSearchResults").text("اكتب نص البحث أولا");
        return;
    }

    const params = { text: text };
    if(limitVar) params.limit = parseInt(limitVar, 10);

    $.ajax({
        url: API_Link + Search_Resume_Path,
        method: "GET",
        data: params,
        success: function (res) {
            $("#resumeSearchResults").html(
                `<pre>${JSON.stringify(res, null, 2)}</pre>`
            );
        },
        error: function (xhr) {
            $("#resumeSearchResults").text(
                `Error ${xhr.status}: ${xhr.responseText}`
            )
        }
    })
})

// Semantic Search 
$("#btnSemanticSearch").on("click", function () {
    const queryText = $("#semanticQueryText").val().trim();
    const topKVar = $("#semanticTopK").val().trim();

    if (!queryText) {
        $("#semanticResults").text("اكتب نص البحث أولاً");
        return;
    }

    const body = {
        query: queryText,
        top_k: topKVar ? parseInt(topKVar, 10) : 5
    };

    $.ajax({
        url: API_Link + Search_Query_Path,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(body),
        success: function (res) {
            $("#semanticResults").html(renderSemanticResults(res));
        },
        error: function (xhr) {
            $("#semanticResults").text(`Error ${xhr.status}: ${xhr.responseText}`);
        }
    });
});

// Render Function
function renderSemanticResults(list) {
    if (!Array.isArray(list) || list.length === 0) {
        return "<p class='text-gray-500'>لا يوجد نتائج</p>";
    }

    let html = "";
    list.forEach(item => {
        html += `
        <div class="border border-gray-200 rounded-lg p-4 mb-3 bg-gray-50 hover:bg-gray-100 transition">
            <p class="mb-1"><strong>الملف:</strong> <span class="text-blue-600">${item.filename}</span></p>
            <p class="mb-1"><strong>معامل التشابه:</strong> <span class="text-green-600">${(item.similarity * 100).toFixed(2)}%</span></p>
            <p class="mb-2"><strong>Resume ID:</strong> ${item.resume_id}</p>
            
            <details class="mt-2">
                <summary class="cursor-pointer text-blue-600 hover:text-blue-800 font-medium">
                    عرض النص الكامل ▼
                </summary>
                <pre class="mt-2 p-3 bg-white border rounded text-xs whitespace-pre-wrap overflow-auto max-h-64">${item.resume_markdown}</pre>
            </details>
        </div>
        `;
    });

    return html;
}

// Rank Resumes
$("#btnRankResumes").on("click", function () {
  const jobText = ($("#rankText").val() || "").trim();

  if (!jobText) {
    $("#rankResults").text("ادخل الوصف الوظيفي أولاً");
    return;
  }

  const body = { text: jobText };

  $.ajax({
    url: API_Link + Resume_Rank_Path,
    method: "POST",
    contentType: "application/json; charset=utf-8",
    dataType: "json",
    data: JSON.stringify(body),

    success: function (res) {
  $("#rankResults").html(renderRankResults(res));
},


    error: function (xhr) {
      console.log("RANK ERROR STATUS:", xhr.status);
      console.log("RANK ERROR RESPONSE:", xhr.responseText);
      $("#rankResults").text(`Error ${xhr.status}: ${xhr.responseText}`);
    }
  });
});

// Render Function
function renderRankResults(res) {
  if (!res || !Array.isArray(res.rankresumes) || res.rankresumes.length === 0) {
    return "<p class='text-gray-500'>لا يوجد نتائج</p>";
  }

  const list = res.rankresumes;

  let html = `
    <div class="overflow-auto">
      <table class="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-2 border-b text-right">Resume ID</th>
            <th class="p-2 border-b text-right">Name</th>
            <th class="p-2 border-b text-right">Rank</th>
            <th class="p-2 border-b text-right">Score</th>
          </tr>
        </thead>
        <tbody>
  `;

  // Rows
  list.forEach(item => {
    html += `
      <tr class="bg-white hover:bg-gray-50">
        <td class="p-2 border-b">${item.resume_id ?? ""}</td>
        <td class="p-2 border-b">${item.name ?? ""}</td>
        <td class="p-2 border-b">${item.rank ?? ""}</td>
        <td class="p-2 border-b">${item.score ?? ""}</td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  return html;
}

