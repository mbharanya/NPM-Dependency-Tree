const errorElement = document.getElementById("error")
const tumbleElement = document.getElementById("tumble")
const packageNameInput = document.querySelector("input[name='package-name']");
const versionDropdown = document.querySelector("select#version-dropdown");


document.addEventListener('submit', async function (event) {
    // Prevent form from submitting to the server
    event.preventDefault();
    errorElement.style.display = 'none';
    tumbleElement.style.display = 'none';

    // if we end up having more than one form, this needs to change...
    const data = new FormData(event.target);
    const formData = Object.fromEntries(data.entries());

    const dependencyResponse = await getDependencies(formData["package-name"], formData["package-version"])
    updateTree(dependencyResponse)
});

packageNameInput.addEventListener("blur", event => {
    const defaultOption = document.createElement("option")
    defaultOption.value = "latest"
    defaultOption.text = "latest"
    for (let i = 0; i < versionDropdown.options.length; i++) {
        versionDropdown.options[i] = null
    }
    versionDropdown.options.add(defaultOption)
})

document.querySelector("select#version-dropdown").addEventListener("click", async (event) => {
    const packageName = packageNameInput.value;
    const response = await fetch(`/api/versions/${encodeURIComponent(packageName)}`)
    const responseJson = await response.json();
    if (response.status >= 200 && response.status < 300) {
        const dropdown = versionDropdown
        responseJson.versions.map(v => {
            const option = document.createElement("option");
            option.value = v
            option.text = v
            dropdown.add(option)
        })
    } else {
        errorElement.innerHTML = "❗ " + responseJson.error
        errorElement.style.display = "block"
    }
})

async function getDependencies(packageName, version) {
    const response = await fetch(`/api/dependencies/${encodeURIComponent(packageName)}/${version ? encodeURIComponent(version) : "latest"}`)
    const responseJson = await response.json();

    if (response.status >= 200 && response.status < 300) {
        showTumbleWeedIfNecessary(packageName, responseJson);
        return responseJson
    } else {
        errorElement.innerHTML = "❗ " + responseJson.error
        errorElement.style.display = "block"
    }
    return { dependencies: [], devDependencies: [] }

}

function showTumbleWeedIfNecessary(packageName, responseJson) {
    const topLevelPackageName = packageNameInput.value;
    if (packageName == topLevelPackageName && responseJson.dependencies.length === 0 && responseJson.devDependencies.length === 0) {
        tumbleElement.style.display = "block";
        tumbleElement.innerHTML = `<p>It seems this package does not have any dependencies</p>
        <img src="img/tumbleweed.webp">`;
    }
}


function updateTree(dependencyResponse) {
    const treeUl = document.querySelector("#myUL")

    treeUl.innerHTML = ""

    dependencyResponse.dependencies.map(dep => {
        treeUl.innerHTML += getDependencyDomItem(dep)
    })
    dependencyResponse.devDependencies.map(dep => {
        treeUl.innerHTML += getDependencyDomItem(dep, true)
    })
    addCaretClickHandler()
}

function addCaretClickHandler() {
    const itemList = document.getElementsByClassName("caret");
    [...itemList].forEach(element => {
        element.removeEventListener("click", clickEventListener)
        element.addEventListener("click", clickEventListener)
    }
    );
}

async function clickEventListener(event) {
    const name = event.currentTarget.dataset.dependencyName;
    const version = event.currentTarget.dataset.dependencyVersion;
    const parent = this.parentElement;

    const childDependencies = await getDependencies(name, version);

    if (parent) {
        if (childDependencies.dependencies?.length > 0 || childDependencies.devDependencies?.length > 0) {
            parent.innerHTML += `<ul class="nested">
                    ${childDependencies?.dependencies.map(getDependencyDomItem).join("\n")}
                    ${childDependencies?.devDependencies.map(d => getDependencyDomItem(d, true)).join("\n")}
                </ul>`;

            this.classList.toggle("caret-down");
            addCaretClickHandler();
        } else {
            parent.innerHTML += `<ul class="nested"><li>No more dependencies  ¯\\_(ツ)_/¯</li></ul>`;
        }
        parent.querySelector(".nested").classList.toggle("active");
    }
}

function getDependencyDomItem(dependency, isDev = false) {
    return `
    <li>
        <span class="caret" data-dependency-name="${dependency.name}" data-dependency-version="${dependency.version}">
            <span class="${isDev ? "dev-dependency" : ""}">
                <span class="dependency-name">${dependency.name}</span> - <span class="dependency-version">${dependency.version}</span>
            </span>
        </span>
    </li>
    `
}