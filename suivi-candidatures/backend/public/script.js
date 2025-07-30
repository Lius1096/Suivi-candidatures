const apiBase = "http://localhost:3000/api/candidatures";
const form = document.getElementById("candidatureForm");
const generateBtn = document.getElementById("generateLetterBtn");
const tableBody = document.getElementById("candidaturesTableBody");
const filterCheckbox = document.getElementById("filterNoResponse");

async function fetchCandidatures() {
  const res = await fetch(apiBase);
  const data = await res.json();
  renderTable(data);
}

function renderTable(candidatures) {
  const showOnlyNoResponse = filterCheckbox?.checked ?? false;
  tableBody.innerHTML = "";

  const filtered = showOnlyNoResponse
    ? candidatures.filter(c => !c.reponse)
    : candidatures;

  filtered.forEach(c => {
    const hasResponse = !!c.reponse; // force boolean
    const tr = document.createElement("tr");
    tr.classList.add("border-b", "border-gray-200");

    tr.innerHTML = `
      <td class="py-3 px-6">${c.email}</td>
      <td class="py-3 px-6"><a href="${c.site_url}" target="_blank" class="text-blue-600 underline">${c.site_url}</a></td>
      <td class="py-3 px-6">${c.entreprise}</td>
      <td class="py-3 px-6">${c.cv ? `<a href="${c.cv}" class="text-blue-500 underline" target="_blank">Voir CV</a>` : "-"}</td>
      <td class="py-3 px-6 whitespace-pre-wrap">${c.infos_entreprise || ""}</td>
      <td class="py-3 px-6">${hasResponse ? "✅ Oui" : "❌ Non"}</td>
      <td class="py-3 px-6 space-x-2">
        ${!hasResponse ? `<button data-id="${c._id}" class="mark-response-btn bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">Marquer réponse</button>` : ""}
        <button data-id="${c._id}" class="delete-cand-btn bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Supprimer</button>
      </td>
    `;

    tableBody.appendChild(tr);
  });

  // Bouton "Marquer réponse"
  document.querySelectorAll(".mark-response-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      await fetch(`${apiBase}/${id}/mark-response`, { method: "POST" });
      fetchCandidatures();
    });
  });

  // Bouton "Supprimer"
  document.querySelectorAll(".delete-cand-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      if (confirm("Supprimer cette candidature ?")) {
        await fetch(`${apiBase}/${id}`, { method: "DELETE" });
        fetchCandidatures();
      }
    });
  });
}

// Soumission formulaire
form.addEventListener("submit", async e => {
  e.preventDefault();
  const formData = new FormData(form);

  const res = await fetch(apiBase, {
    method: "POST",
    body: formData
  });

  if (res.ok) {
    form.reset();
    fetchCandidatures();
  } else {
    alert("Erreur lors de l'ajout");
  }
});

// Génération lettre
generateBtn.addEventListener("click", async () => {
  const entreprise = form.elements["entreprise"].value;
  const infos_entreprise = form.elements["infos_entreprise"].value;

  if (!entreprise || !infos_entreprise) {
    alert("Merci de remplir le nom et les infos de l'entreprise pour générer la lettre");
    return;
  }

  const res = await fetch(`${apiBase}/generate-letter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      entreprise,
      infos_entreprise,
      cv: "Votre CV synthétisé ici (optionnel)"
    })
  });

  if (res.ok) {
    const data = await res.json();
    alert("Lettre générée :\n\n" + data.lettre);
  } else {
    alert("Erreur génération lettre");
  }
});

// 🔁 Recharger si case cochée
filterCheckbox?.addEventListener("change", fetchCandidatures);

// ⚡ Charger au démarrage
fetchCandidatures();
