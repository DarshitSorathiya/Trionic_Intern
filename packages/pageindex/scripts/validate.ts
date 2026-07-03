import fs from "fs";
import path from "path";

type PageIndexNode = {
    node_id: string;
    number: string;
    title: string;
    text: string;
};

const ARTIFACT_PATH = path.join(
    process.cwd(),
    "packages",
    "pageindex",
    "artifacts",
    "ipc-tree.json"
);

const raw = fs.readFileSync(ARTIFACT_PATH, "utf-8");

const nodes: PageIndexNode[] = JSON.parse(raw);

function getRandomSections(
    count: number
): PageIndexNode[] {
    const shuffled = [...nodes].sort(
        () => 0.5 - Math.random()
    );

    return shuffled.slice(0, count);
}

function validateNode(node: PageIndexNode) {
    const hasTitle =
        typeof node.title === "string" &&
        node.title.trim().length > 0;

    const hasText =
        typeof node.text === "string" &&
        node.text.trim().length >= 20;

    const validId =
        node.node_id.startsWith("IPC-1860/S-");

    return hasTitle && hasText && validId;
}

function main() {
    const sample = getRandomSections(10);

    let passed = 0;

    console.log("\nIPC TREE VALIDATION\n");

    for (const node of sample) {
        const valid = validateNode(node);

        if (valid) {
            passed++;

            console.log(
                `[PASS] ${node.node_id}`
            );
        } else {
            console.log(
                `[FAIL] ${node.node_id}`
            );
        }
    }

    console.log("\n-------------------");
    console.log(
        `Validated: ${passed}/10`
    );

    if (passed === 10) {
        console.log(
            "Validation successful."
        );
    } else {
        console.log(
            "Validation issues detected."
        );
    }

    const reportPath = path.join(
        process.cwd(),
        "packages",
        "pageindex",
        "reports",
        "ipc-source-validation.json"
    );

    const reportData = {
        total_sections_validated: 10,
        passed,
        failed: 10 - passed,
        status: passed === 10 ? "SUCCESS" : "FAILED",
        timestamp: new Date().toISOString()
    };

    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2), "utf-8");
    console.log(`\nValidation artifact generated:\npackages/pageindex/reports/ipc-source-validation.json`);
}

main();