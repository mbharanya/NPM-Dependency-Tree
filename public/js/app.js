document.addEventListener('submit', async function (event) {
    // Prevent form from submitting to the server
    event.preventDefault();

    // if we end up having more than one form, this needs to change...
    const data = new FormData(event.target);
    const formData = Object.fromEntries(data.entries());

    const dependencyResponse = await getDependencies(formData["package-name"], formData["package-version"])
    updateTree(dependencyResponse)
});

async function getDependencies(packageName, version) {
    const response = await fetch(`/api/dependencies/${encodeURIComponent(packageName)}/${version ? encodeURIComponent(version) : "latest"}`)
    //TODO: handle errors
    const dependencyResponse = await response.json();
    console.log(dependencyResponse)
    return dependencyResponse
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
    for (let i = 0; i < itemList.length; i++) {
        itemList[i].addEventListener("click", async function (event) {
            event.stopPropagation();

            const name = event.target.dataset.dependencyName
            const version = event.target.dataset.dependencyVersion
            const childDependencies = await getDependencies(name, version)
            const parent = this.parentElement
            if (parent) {
                if (childDependencies.dependencies.length > 0 || childDependencies.devDependencies.length > 0) {
                    parent.innerHTML += `<ul class="nested">
                        ${childDependencies?.dependencies.map(getDependencyDomItem).join("\n")}
                        ${childDependencies?.devDependencies.map(d => getDependencyDomItem(d, true)).join("\n")}
                    </ul>`

                    addCaretClickHandler()
                    this.classList.toggle("caret-down");
                } else {
                    parent.innerHTML += `<ul class="nested"><li>No more dependencies  ¯\_(ツ)_/¯</li></ul>`
                }
                parent.querySelector(".nested").classList.toggle("active");
            }
        });
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