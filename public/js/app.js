document.addEventListener('submit', async function (event) {
    // Prevent form from submitting to the server
    event.preventDefault();

    // if we end up having more than one form, this needs to change...
    const data = new FormData(event.target);
    const formData = Object.fromEntries(data.entries());

    const dependencyResponse = await getDependencies(formData["package-name"])
    updateTree(dependencyResponse)
});

async function getDependencies(packageName, version) {
    const response = await fetch(`/api/dependencies/${packageName}/${version || "latest"}`)
    //TODO: handle errors
    const dependencyResponse = await response.json();
    console.log(dependencyResponse)
    return dependencyResponse
}

function updateTree(dependencyResponse) {
    const treeUl = document.querySelector("#myUL")

    treeUl.innerHTML = ""

    dependencyResponse.dependencies.map(dep => {
        treeUl.innerHTML += `
        <li>
            <span class="caret" data-dependency="${dep.name}:${dep.version}">
                <span class="dependency-name">${dep.name}</span> - <span class="dependency-version">${dep.version}</span>
            </span>
        </li>`
    })
    addCaretClickHandler()
}

function addCaretClickHandler() {
    const itemList = document.getElementsByClassName("caret");
    for (let i = 0; i < itemList.length; i++) {
        itemList[i].addEventListener("click", async function (event) {
            console.log(event.target.innerHTML)

            const dependency = event.target.dataset.dependency
            const name = dependency.split(":")[0]
            const version = dependency.split(":")[1]
            const childDependencies = await getDependencies(name, version)

            if (childDependencies.dependencies.length > 0 || childDependencies.devDependencies.length > 0) {
                const parent = this.parentElement

                parent.innerHTML += `<ul class="nested">
                ${childDependencies?.dependencies.map(getDependencyDomItem).join("\n")}
                ${childDependencies?.devDependencies.map(d => getDependencyDomItem(d, true)).join("\n")}
                </ul>`

                parent.querySelector(".nested").classList.toggle("active");
                addCaretClickHandler()
                this.classList.toggle("caret-down");
            }
        });
    }
}

function getDependencyDomItem(dependency, isDev = false) {
    return `
    <li>
        <span class="caret" data-dependency="${dependency.name}:${dependency.version}">
            <span class="${isDev ? "dev-dependency" :""}">
                <span class="dependency-name">${dependency.name}</span> - <span class="dependency-version">${dependency.version}</span>
            </span>
        </span>
    </li>
    `
}