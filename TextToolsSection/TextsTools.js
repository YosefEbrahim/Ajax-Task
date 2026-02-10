
const API_URL = "http://localhost:8000";

const app = {
    //  دالة وهمية عشان mainBase.js ما يعطي Error
    checkSystemHealth: function() { 
        console.log("System Ready & Connected to API ✅"); 
    },

    fixGrammar: function() {
        var text = $("#grammarInput").val();
        if(!text) return alert("الرجاء إدخال نص!");
        
        $("#grammarResult").show();
        $("#grammarOutput").html('<div class="text-center py-4"><span class="text-blue-600 font-bold animate-pulse">⏳ جاري تحليل النص وتصحيحه...</span></div>');

        $.ajax({
            url: API_URL + "/fix-grammar",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ "text": text }),
            success: function(res) {
                if (res.corrected_text) {
                    var data = res.corrected_text;
                    var score = Math.round(data.correct_percentage);
                    var scoreColor = score > 80 ? "bg-green-600" : (score > 50 ? "bg-yellow-500" : "bg-red-600");

                    // تجهيز قائمة الأخطاء
                    var mistakesHTML = "";
                    if (data.incorrect_words && data.incorrect_words.length > 0) {
                        mistakesHTML = `<div class="mt-4"><h5 class="font-bold text-red-700 mb-2 border-b pb-1">🔍 تفاصيل الأخطاء:</h5><ul class="space-y-2">`;
                        data.incorrect_words.forEach(function(item) {
                            mistakesHTML += `
                                <li class="flex items-center justify-between bg-red-50 p-2 rounded border border-red-100 text-sm">
                                    <span class="text-red-600 font-bold line-through">${item.incorrect}</span>
                                    <span class="text-gray-400">⬅️</span>
                                    <span class="text-green-700 font-bold">${item.correct}</span>
                                </li>`;
                        });
                        mistakesHTML += `</ul></div>`;
                    } else {
                        mistakesHTML = `<div class="mt-4 p-2 bg-green-50 text-green-700 text-sm text-center font-bold">🎉 لا توجد أخطاء إملائية!</div>`;
                    }

                    var reportHTML = `
                        <div class="space-y-5 text-right" dir="ltr">
                            <div>
                                <div class="flex justify-between mb-1">
                                    <span class="text-xs font-bold text-gray-500">Grammar Score</span>
                                    <span class="text-xs font-bold ${score > 80 ? 'text-green-700' : 'text-red-700'}">${score}%</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2.5">
                                    <div class="${scoreColor} h-2.5 rounded-full transition-all duration-1000" style="width: ${score}%"></div>
                                </div>
                            </div>
                            <div class="p-5 bg-green-50 border-l-4 border-green-500 rounded shadow-sm">
                                <h4 class="text-green-900 font-extrabold text-lg mb-1">Corrected Text:</h4>
                                <p class="text-xl text-gray-800 font-medium leading-relaxed">${data.corrected_text_t5}</p>
                            </div>
                            ${mistakesHTML}
                        </div>`;
                    $("#grammarOutput").html(reportHTML);
                } else {
                    $("#grammarOutput").text("الرد غير متوقع: " + JSON.stringify(res));
                }
            },
            error: function() { $("#grammarOutput").html('<span class="text-red-600 font-bold"> فشل الاتصال بالسيرفر</span>'); }
        });
    },

    translateText: function() {
        var text = $("#transInput").val();
        if(!text) return alert("اكتب النص!");

        $("#transOutput").text("⏳...");
        $.ajax({
            url: API_URL + "/translate-text",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ "text": text, "to_lang": "ar" }),
            success: function(res) {
                var result = res.translation;
                $("#transOutput").text(result).addClass("text-black font-bold");
            },
            error: function() { $("#transOutput").text("خطأ في الاتصال"); }
        });
    },

    translateDoc: function() {
        var file = $("#docInput")[0].files[0];
        if(!file) return alert("الرجاء اختيار ملف!");

        var formData = new FormData();
        formData.append("file", file);
        formData.append("to_lang", "ar");

        $("#docResult").removeClass("hidden").html('<span class="text-blue-600 font-bold">⏳ جاري الترجمة...</span>');

        $.ajax({
            url: API_URL + "/translate-document",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function(res) {
                var translatedText = res.translation || res.result || "تمت الترجمة";
                
                $("#docResult").html(`
                    <div class="mt-4 p-4 bg-white border border-green-200 rounded text-right">
                        <h4 class="font-bold text-green-700 mb-2">✅ تمت الترجمة:</h4>
                        <p class="text-gray-800 whitespace-pre-wrap leading-relaxed">${translatedText}</p>
                    </div>
                `);
//هاد عشان ينزل ال file بدون ما يضغط
                var blob = new Blob([translatedText], { type: "text/plain;charset=utf-8" });
                var link = document.createElement("a");
                link.href = window.URL.createObjectURL(blob);
                link.download = "Translated_" + file.name + ".txt";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            },
            error: function() { $("#docResult").html('<span class="text-red-600 font-bold"> حدث خطأ</span>'); }
        });
    },
    init: function() {
        var componentPath = "TextToolsSection/Text_Tool_component.html";

        $("#text-tools").load(componentPath, function(response, status, xhr) {
            if (status == "error") {
                console.log(" فشل تحميل الملف: " + xhr.status + " " + xhr.statusText);
                $("#text-tools").html("<p class='text-red-500'>عذراً، حدث خطأ في تحميل الأدوات.</p>");
            } else {
                console.log(" تم تحميل أدوات النصوص بنجاح!");
                lucide.createIcons();
            }
        });
    }
};

$(document).ready(function() {
    app.init();
});

window.app = app;