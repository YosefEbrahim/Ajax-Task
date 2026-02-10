
// Router / Navigation
const router = {
  navigate: (targetId) => {
    // Update Sidebar
    document.querySelectorAll(".nav-item").forEach((btn) => {
      const icon = btn.querySelector(".lucide");
      const desc = btn.querySelector("p.text-xs");

      if (btn.dataset.target === targetId) {
        btn.classList.add("bg-blue-600", "text-white");
        btn.classList.remove("hover:bg-gray-100");
        if (icon) icon.classList.add("text-white");
        if (desc) {
          desc.classList.remove("text-gray-500");
          desc.classList.add("text-blue-100");
        }
      } else {
        btn.classList.remove("bg-blue-600", "text-white");
        btn.classList.add("hover:bg-gray-100");
        if (icon) icon.classList.remove("text-white");
        if (desc) {
          desc.classList.add("text-gray-500");
          desc.classList.remove("text-blue-100");
        }
      }
    });

    // Hide all sections
    document.querySelectorAll("section").forEach((sec) => {
      sec.classList.remove("active-section");
      sec.classList.add("hidden-section");
    });

    // Show target
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      targetSection.classList.remove("hidden-section");
      targetSection.classList.add("active-section");
    }

    // Update Header
    const activeBtn = document.querySelector(
      `.nav-item[data-target="${targetId}"]`,
    );
    if (activeBtn) {
      const label = activeBtn.querySelector("p.font-medium").textContent;
      const desc = activeBtn.querySelector("p.text-xs").textContent;
      const iconMap = {
        health: "activity",
        "cv-upload": "file-text",
        "bulk-upload": "files",
        search: "search",
        ranking: "trending-up",
        "job-posting": "briefcase",
        "text-tools": "languages",
        salary: "dollar-sign",
        assistant: "bot",
      };
      const iconName = iconMap[targetId] || "circle";

      document.getElementById("current-section-label").textContent = label;
      document.getElementById("section-title").textContent = label;
      document.getElementById("section-desc").textContent = desc;

      const headerIcon = document.getElementById("section-icon");
      headerIcon.setAttribute("data-lucide", iconName);
      lucide.createIcons({
        nameAttr: "data-lucide",
        attrs: { class: "w-6 h-6 text-blue-600" },
      });
    }

    // Auto-refresh icons in newly visible section
    lucide.createIcons();

    // Mobile menu close
    if (window.innerWidth < 768) {
      document.getElementById("sidebar").classList.add("translate-x-full");
    }
    const container = document.getElementById("section-tags");

    container.innerHTML = "";
    //switch pages
    if (targetId === "cv-upload") {
      getCvATSUploadPage();
    }
    if (targetId == "bulk-upload") {
      getManyCvsATSUploadPage();
    }
  },
};

// Toggle Sidebar on mobile
const menuBtn = document.getElementById("mobile-menu-btn");
if (menuBtn) {
  menuBtn.addEventListener("click", () => {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("translate-x-full");
  });
}

// Initial Load
// document.addEventListener("DOMContentLoaded", () => {
//   router.navigate("health");
//   app.checkSystemHealth();
//   document.getElementById("session-id").textContent =
//     app.currentSessionId.slice(-8);
// });

// Update the global window object for onclick handlers in HTML
window.router = router;
const cvMemoryList = [];

//
function getCvATSUploadPage() {
  const container = document.getElementById("section-tags");
  container.classList.add("flex", "flex-col", "gap-5");

  //content area
  const cvContentArea = document.createElement("div");
  cvContentArea.id = "cv-content-area";
  cvContentArea.className = `flex flex-col gap-3`;

  //main card
  const uploadCvCard = document.createElement("div");
  uploadCvCard.classList.add(
    "w-full",
    "min-h-[80px]",
    "bg-white",
    "border",
    "border-gray-200",
    "rounded-lg",
    "p-4",
    "flex",
    "mt-3",
  );

  //button
  const uploadCvButton = document.createElement("button");
  uploadCvButton.id = "upload-cv-btn";
  uploadCvButton.className =
    "text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition flex gap-3 duration-500 ease-in-out flex items-center justify-center";
  uploadCvButton.textContent = "ارفع السيرة الذاتية";

  //select list
  const langSelect = document.createElement("select");
  langSelect.id = "language-select";
  langSelect.className = `
  w-30 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
  focus:ring-blue-500 focus:border-blue-500 block p-2.5 pr-10 outline-none mr-5
  transition duration-300 appearance-none
`;
  langSelect.style.backgroundImage = `url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>')`;
  langSelect.style.backgroundRepeat = "no-repeat";
  langSelect.style.backgroundPosition = "right 0.7rem center"; // <--- THIS MOVES THE ARROW
  langSelect.style.backgroundSize = "1em";
  //list options
  const optEn = document.createElement("option");
  optEn.value = "en";
  optEn.textContent = "English";
  langSelect.appendChild(optEn);

  const optAr = document.createElement("option");
  optAr.value = "ar";
  optAr.textContent = "العربية";
  langSelect.appendChild(optAr);

  uploadCvButton.onclick = findCvForSingleCvPage;

  container.appendChild(uploadCvCard);
  container.appendChild(cvContentArea);
  uploadCvCard.appendChild(uploadCvButton);
  uploadCvCard.appendChild(langSelect);
}

function findCvForSingleCvPage() {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".pdf,.doc,.docx";

  const btn = document.getElementById("upload-cv-btn");

  fileInput.onchange = async function (e) {
    const file = e.target.files[0];

    // code in short
    // change button to loading and if data is fetched create accordions with data from api
    if (file) {
      const originalText = btn.textContent;
      btn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        جارٍ الرفع...
      `;

      btn.disabled = true;
      btn.classList.add("opacity-70", "cursor-not-allowed");

      try {
        const result = await sendCvToApi(file);

        if (result.success) {
          alert("تم الرفع بنجاح.");
          const container = document.getElementById("section-tags");

          const cvContentArea = document.getElementById("cv-content-area");
          cvContentArea.innerHTML = "";

          // const elements = container.children;
          // for (let i = elements.length - 1; i >= 0; i--) {
          //   if (!elements[i].contains(btn)) {
          //     elements[i].remove();
          //   }
          // }

          cvResultSuccessCreateAccordions(result.data);
        } else {
          alert("فشل الرفع: " + (result.error || "خطأ غير معروف"));
        }
      } catch (error) {
        console.error("Upload Error:", error);
      } finally {
        btn.innerHTML = "";
        btn.textContent = originalText;
        btn.disabled = false;
        btn.classList.remove("opacity-70", "cursor-not-allowed");
      }
    }
  };

  fileInput.click();
}

async function sendCvToApi(file) {
  const formData = new FormData();
  const selectedLanguage = document.getElementById("language-select").value;

  formData.append("file", file);
  formData.append("language", selectedLanguage);

  try {
    const response = await fetch("http://localhost:8000/upload-cv", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, data: data };
    } else {
      return { success: false, status: response.status };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function cvResultSuccessCreateAccordions(data, cvFileName = null) {
  if (cvFileName != null) {
    const heading = document.createElement("h3");
    heading.textContent = `اسم الملف : ${cvFileName}`;
    heading.className = "text-xl font-bold text-gray-800  mt-2";
    const line = document.createElement("hr");
    line.className = "border-t border-gray-200 my-4";

    const contentArea = document.getElementById("cv-content-area");

    contentArea.appendChild(heading);
    contentArea.appendChild(line);
  }

  // 1. General Info (as a string)
  if (data.general_information) {
    const info = data.general_information;
    createAccordion(
      "المعلومات العامة",
      `
    <p><strong>الاسم:</strong> ${info.name}</p>
    <p><strong>البريد الالكتروني:</strong> ${info.email}</p>
    <p><strong>منطقة السكن:</strong> ${info.location}</p>
    <p><strong>رقم الهاتف:</strong> ${info.phone_number}</p>
    <p><strong>ملخص السيرة الذاتية:</strong> ${info.profile_summary}</p>
  `,
    );
  }

  if (data.skills) {
    createAccordion("الخبرات التقنية", data.skills);
  }
  if (data.certificates) {
    createAccordion("الدورات", data.certificates);
  }

  if (data.education) {
    createAccordion("مستوى تعليم", data.education);
  }

  if (data.work_experience && Array.isArray(data.work_experience)) {
    const expHtml = data.work_experience
      .map((job) => {
        // 1. Create the bullet points list
        const respList = (job.responsibilities || [])
          .map(
            (r) => `
        <li class="text-gray-600 text-sm flex items-start gap-2">
          <span class="text-blue-500 font-bold">•</span> <span class="font-bold">${r}</span>
        </li>
      `,
          )
          .join("");
        const achievements = (job.achievements || [])
          .map(
            (r) => `
        <li class="text-gray-600 text-sm flex items-start gap-2">
          <span class="text-blue-500 font-bold">•</span> <span class="font-bold">${r}</span>
        </li>
      `,
          )
          .join("");

        // 2. Create the technology tags
        const techPills = (job.technologies || [])
          .map(
            (tech) => `
        <span class="bg-white text-gray-500 text-[15px] font-bold px-2 py-0.5 rounded border border-gray-200 shadow-sm">
          ${tech}
        </span>
      `,
          )
          .join("");

        // 3. Return the full HTML for this specific job
        return `
      <div class="mb-8 border-l-2 border-blue-100 pl-6 ml-2 last:border-0 last:mb-0 relative">
        <div class="absolute w-4 h-4 bg-blue-600 rounded-full -left-[9px] top-1 border-4 border-white shadow-sm"></div>
        
        <div class="flex flex-wrap justify-between items-start gap-2 mb-1">
          <h4 class="font-extrabold text-gray-800 text-lg leading-tight">${job.job_title}</h4>
          <span class="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-md uppercase border border-blue-100">
            ${job.company_name}
          </span>
        </div>

        <div class="flex items-center gap-4 text-sm text-gray-500 mb-4 font-medium">
          <span class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            ${job.location ?? "غير معروف"}
          </span>
          <span class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            ${job.start_date} — ${job.end_date || "Present"}
          </span>
        </div>
        <div class="mb-4">
          <ul class="space-y-2"> المسؤوليات: ${respList}</ul>
        </div>
        <div class="mb-4">
          <ul class="space-y-2"> الإنجازات: ${achievements}</ul>
        </div>
        <div class="flex flex-wrap gap-2 mt-4">التكنلوجيات المستخدمة: ${techPills}</div>
      </div>
    `;
      })
      .join("");

    createAccordion("الخبرات العملية", expHtml);
  }
}

function createAccordion(title, content) {
  const container = document.getElementById("cv-content-area");

  const wrapper = document.createElement("div");
  wrapper.className =
    "w-full bg-white border border-gray-200 rounded-lg mt-3 overflow-hidden transition-all shadow-sm";

  // 1. Header Button
  const header = document.createElement("button");
  header.className =
    "w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors duration-300";

  header.innerHTML = `
    <span class="font-bold text-gray-700 uppercase tracking-tight transition-colors duration-300 title-text">${title}</span>
    <span class="text-gray-400 transition-transform duration-500 ease-in-out arrow-icon">
        <svg fill="none" height="24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24">
          <path d="M6 9l6 6 6-6"></path>
        </svg>
    </span>
  `;

  // 2. Animated Content Container
  // The 'grid-rows-[0fr]' is the secret to height transitions in Tailwind
  const contentDiv = document.createElement("div");
  contentDiv.className =
    "grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-in-out";

  const inner = document.createElement("div");
  inner.className = "overflow-hidden";

  const body = document.createElement("div");
  body.className =
    "p-4 border-t border-gray-100 text-gray-600 leading-relaxed opacity-0 transition-opacity duration-500";

  // 3. Logic to handle your custom strings vs arrays (Skills)
  if (Array.isArray(content)) {
    body.innerHTML = content
      .map(
        (item) =>
          `<span class="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold m-1 border border-blue-100">${item}</span>`,
      )
      .join("");
  } else {
    body.innerHTML = content; // This handles your 'expHtml' strings
  }

  // 4. Toggle Logic
  header.onclick = () => {
    const isClosed = contentDiv.classList.contains("grid-rows-[0fr]");

    // Toggle Height (The Slide)
    contentDiv.classList.toggle("grid-rows-[0fr]", !isClosed);
    contentDiv.classList.toggle("grid-rows-[1fr]", isClosed);

    // Toggle Opacity (The Fade)
    body.classList.toggle("opacity-0", !isClosed);
    body.classList.toggle("opacity-100", isClosed);

    // Styling Toggles
    header.querySelector(".arrow-icon").classList.toggle("rotate-180");
    header.querySelector(".arrow-icon").classList.toggle("text-blue-600");
    header.querySelector(".title-text").classList.toggle("text-blue-600");
  };

  inner.appendChild(body);
  contentDiv.appendChild(inner);
  wrapper.appendChild(header);
  wrapper.appendChild(contentDiv);
  container.appendChild(wrapper);
}

//generate multiple cvs page
function getManyCvsATSUploadPage() {
  const container = document.getElementById("section-tags");
  container.classList.add("flex", "flex-col", "gap-5");
  const uploadCvCard = document.createElement("div");

  uploadCvCard.classList.add(
    "w-full",
    "min-h-[80px]",
    "bg-white",
    "border",
    "border-gray-200",
    "rounded-lg",
    "p-4",
    "flex",
    "mt-3",
  );

  //cv list
  const cvListContentArea = document.createElement("div");
  cvListContentArea.id = "cv-content-area";
  cvListContentArea.className = "flex flex-col gap-3";

  //cv list info
  const cvsListToUploadDiv = document.createElement("div");
  cvsListToUploadDiv.id = "cvs-list-to-upload";
  cvsListToUploadDiv.className = "flex flex-wrap gap-3";

  //button add to upload list
  const addCvToUploadListButton = document.createElement("button");
  addCvToUploadListButton.id = "add-to-upload-list-btn";
  addCvToUploadListButton.className =
    "text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition  gap-3 duration-500 ease-in-out flex items-center justify-center";
  addCvToUploadListButton.textContent = "اضف سيرة ذاتية";

  addCvToUploadListButton.onclick = findManyForATSUploadCv;

  //upload the list of cvs button
  const uploadListOfCvsButton = document.createElement("button");
  uploadListOfCvsButton.id = "upload-cvs-btn";
  uploadListOfCvsButton.className =
    "text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition  gap-3 duration-500 ease-in-out flex items-center justify-center mr-3";
  uploadListOfCvsButton.textContent = "ارفع السير الذاتية";

  uploadListOfCvsButton.onclick = startFilesUpload;
  //info-text
  const infoTextCVS = document.createElement("span");
  infoTextCVS.textContent = " السير الذاتية :";
  infoTextCVS.className =
    "text-l text-black font-bold mr-3 flex items-center justify-center ml-3";

  //select list
  const langSelect = document.createElement("select");
  langSelect.id = "language-select";
  langSelect.className = `
  w-30 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
  focus:ring-blue-500 focus:border-blue-500 block p-2.5 pr-10 outline-none mr-5
  transition duration-300 appearance-none
`;
  langSelect.style.backgroundImage = `url('data:image/svg+xml;charset=US-ASCII,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>')`;
  langSelect.style.backgroundRepeat = "no-repeat";
  langSelect.style.backgroundPosition = "right 0.7rem center";
  langSelect.style.backgroundSize = "1em";

  //select list options
  const optEn = document.createElement("option");
  optEn.value = "en";
  optEn.textContent = "English";
  langSelect.appendChild(optEn);
  const optAr = document.createElement("option");
  optAr.value = "ar";
  optAr.textContent = "العربية";
  langSelect.appendChild(optAr);

  container.appendChild(uploadCvCard);
  container.appendChild(cvListContentArea);
  uploadCvCard.appendChild(addCvToUploadListButton);
  uploadCvCard.appendChild(uploadListOfCvsButton);
  uploadCvCard.appendChild(langSelect);
  uploadCvCard.appendChild(infoTextCVS);
  uploadCvCard.appendChild(cvsListToUploadDiv);
}

function findManyForATSUploadCv() {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".pdf,.doc,.docx";
  fileInput.multiple = true;

  fileInput.onchange = (e) => {
    // Convert the FileList (which is array-like) into a real Array
    const files = Array.from(e.target.files);

    // Loop through every selected file and pass it to your function
    files.forEach((file) => {
      addCvToList(file);
    });

    // Clear the value so the same file can be selected again if needed
    fileInput.value = "";
  };

  fileInput.click();
}

function addCvToList(file) {
  const isDuplicate = cvMemoryList.some(
    (f) => f.name === file.name && f.size === file.size,
  );

  createFileCapsule(file);

  if (!isDuplicate) {
    cvMemoryList.push(file);
    return true;
  }

  return false;
}
function createFileCapsule(file, onRemove) {
  // 1. The Capsule Container (Pill shape)
  const capsule = document.createElement("div");
  capsule.className =
    "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100 shadow-sm transition-all hover:bg-blue-100";

  // 2. The File Icon (Optional but nice)
  capsule.innerHTML = `
    <svg class="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
    <span class="max-w-[150px] truncate" title="${file.name}">${file.name}</span>
  `;

  // 3. The "X" Remove Button
  const removeBtn = document.createElement("button");
  removeBtn.className =
    "p-0.5 ml-1 text-blue-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors";
  removeBtn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;

  removeBtn.onclick = (e) => {
    e.stopPropagation();

    // 1. Remove from the global memory list
    const index = cvMemoryList.indexOf(file);
    if (index > -1) {
      cvMemoryList.splice(index, 1); 
      
    }

    // 2. Remove visually from the HTML
    capsule.remove();

    // 3. Trigger any extra callback if needed
    if (onRemove) onRemove();
  };

  var cvListInfo = document.getElementById("cvs-list-to-upload");
  capsule.appendChild(removeBtn);
  cvListInfo.appendChild(capsule);
}

async function startFilesUpload() {
  // 1. Start Loading
  setUploadButtonLoading(true);

  // 2. Call your API function
  const result = await sendListOfCvsToApi();

  // 3. Stop Loading (regardless of success or failure)
  setUploadButtonLoading(false);

  // 4. Handle Result
  if (result && result.success) {
    alert("تم الرفع بنجاح!");
    // Optional: clear the list after success
    // cvMemoryList = [];
    // document.getElementById("cvs-list-to-upload").innerHTML = "";

    renderAllCvResults(result.data);
  } else {
    alert("فشل الرفع: " + (result.error || "خطأ غير معروف"));
  }
}

async function sendListOfCvsToApi() {
  if (cvMemoryList.length <= 0) {
    alert("لا يوجد اي سيرة ذاتية للرفع");
    return;
  }

   // --- API LOGIC---
  const formData = new FormData();

  cvMemoryList.forEach((file) => {
    formData.append("files", file);
  });

  const selectedLanguage = document.getElementById("language-select").value;
  formData.append("language", selectedLanguage);

  try {
    const response = await fetch("http://localhost:8000/upload-cvs", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, data: data };
    } else {
      return { success: false, status: response.status };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
  
}

function setUploadButtonLoading(isLoading) {
  const btn = document.getElementById("upload-cvs-btn");
  const uploadFileBtn = document.getElementById("add-to-upload-list-btn");
  if (!btn) return; // Safety check

  if (isLoading) {
    btn.disabled = true;
    btn.classList.add("opacity-75", "cursor-not-allowed");
    uploadFileBtn.classList.add("opacity-75", "cursor-not-allowed");
    uploadFileBtn.disabled = true;

    btn.innerHTML = `
      <svg class="animate-spin ml-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      جارى الرفع...
    `;
  } else {
    // 1. Re-enable
    btn.disabled = false;
    uploadFileBtn.disabled = false;
    btn.classList.remove("opacity-75", "cursor-not-allowed");
    uploadFileBtn.classList.remove("opacity-75", "cursor-not-allowed");

    // 2. Restore Original Text
    btn.textContent = "ارفع السير الذاتية";
  }
}

function renderAllCvResults(responseArray) {
  responseArray.forEach((cv) => {
    
    cvResultSuccessCreateAccordions(cv.data, cv.filename);
  });
}


