function escapeHtml(text) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

function salarySubmit() {
    var titleInput = document.getElementById("salary-title");
    var yearsInput = document.getElementById("salary-years");
    var errorEl = document.getElementById("salary-error");
    var loadingEl = document.getElementById("salary-loading");
    var resultsEl = document.getElementById("salary-results");
    var submitBtn = document.getElementById("salary-submit-btn");

    var jobTitle = titleInput.value.trim();
    var yearsValue = yearsInput.value.trim();

    // Validation
    errorEl.classList.add("hidden");
    errorEl.textContent = "";

    if (jobTitle === "") {
        errorEl.textContent = "يرجى إدخال المسمى الوظيفي";
        errorEl.classList.remove("hidden");
        return;
    }

    if (yearsValue === "") {
        errorEl.textContent = "يرجى إدخال سنوات الخبرة";
        errorEl.classList.remove("hidden");
        return;
    }

    var years = Number(yearsValue);
    if (isNaN(years) || years < 0 || years % 1 !== 0) {
        errorEl.textContent = "سنوات الخبرة يجب أن تكون رقماً صحيحاً غير سالب";
        errorEl.classList.remove("hidden");
        return;
    }

    // UI: loading state
    submitBtn.disabled = true;
    submitBtn.classList.add("opacity-50", "cursor-not-allowed");
    loadingEl.classList.remove("hidden");
    resultsEl.classList.add("hidden");
    document.getElementById("salary-empty").classList.add("hidden");

    // Ajax
    var xhr = new XMLHttpRequest();
    xhr.open("POST", API_BASE + "/get-salaries");
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function () {
        submitBtn.disabled = false;
        submitBtn.classList.remove("opacity-50", "cursor-not-allowed");
        loadingEl.classList.add("hidden");

        if (xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            var listings = data.job_listings;

            if (!listings || listings.length === 0) {
                errorEl.textContent = "لا توجد بيانات رواتب لهذا المسمى الوظيفي";
                errorEl.classList.remove("hidden");
                return;
            }

            // Summary cards
            document.getElementById("salary-monthly").textContent = formatNumber(data.avg_monthly_salary_jod);
            document.getElementById("salary-annual").textContent = formatNumber(data.avg_annual_salary_jod);
            document.getElementById("salary-min").textContent = formatNumber(data.avg_salary_min_jod);
            document.getElementById("salary-max").textContent = formatNumber(data.avg_salary_max_jod);
            document.getElementById("salary-count").textContent = listings.length;

            // Table
            var tbody = document.getElementById("salary-table-body");
            tbody.innerHTML = "";

            for (var i = 0; i < listings.length; i++) {
                var job = listings[i];
                var jodRange = formatNumber(job.salary_min_jod);
                if (job.salary_min_jod !== job.salary_max_jod) {
                    jodRange += " - " + formatNumber(job.salary_max_jod);
                }
                var gbpRange = formatNumber(job.salary_min_gbp);
                if (job.salary_min_gbp !== job.salary_max_gbp) {
                    gbpRange += " - " + formatNumber(job.salary_max_gbp);
                }

                var tr = document.createElement("tr");
                tr.className = "border-b last:border-0 hover:bg-gray-50";
                tr.innerHTML =
                    '<td class="px-4 py-3">' + escapeHtml(job.title) + '</td>' +
                    '<td class="px-4 py-3 text-gray-500">' + escapeHtml(job.location) + '</td>' +
                    '<td class="px-4 py-3"><span class="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">' + jodRange + '</span></td>' +
                    '<td class="px-4 py-3"><span class="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">' + gbpRange + '</span></td>';
                tbody.appendChild(tr);
            }

            resultsEl.classList.remove("hidden");
        } else if (xhr.status === 404) {
            document.getElementById("salary-empty").classList.remove("hidden");
        } else if (xhr.status === 422) {
            var err = JSON.parse(xhr.responseText);
            errorEl.textContent = err.detail[0].msg || "خطأ في البيانات المرسلة";
            errorEl.classList.remove("hidden");
        } else {
            errorEl.textContent = "حدث خطأ في الخادم (رمز " + xhr.status + ")";
            errorEl.classList.remove("hidden");
        }
    };

    xhr.onerror = function () {
        submitBtn.disabled = false;
        submitBtn.classList.remove("opacity-50", "cursor-not-allowed");
        loadingEl.classList.add("hidden");
        errorEl.textContent = "تعذر الاتصال بالخادم";
        errorEl.classList.remove("hidden");
    };

    xhr.send(JSON.stringify({
        job_title: jobTitle,
        experience_years: years
    }));
}

function formatNumber(num) {
    return Number(num).toLocaleString("en", { maximumFractionDigits: 2 });
}
