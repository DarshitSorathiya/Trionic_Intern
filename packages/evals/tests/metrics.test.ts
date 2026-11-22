import assert from "node:assert/strict";
import { test } from "node:test";
import { completeness } from "../src/metrics/completeness";
import type { Fixture } from "../src/types";

function createFixture(text: string): Fixture {
  return {
    fixture_id: "rti-completeness",
    doc_type: "rti_application",
    language: "en",
    agent_traces: [],
    draft_output: {
      text,
      cite_markers: [],
    },
    ground_truth: {
      valid_node_ids: [],
      required_sections: ["date+signature"],
    },
  };
}

test("date+signature completeness requires both date and signature", async () => {
  const result = await completeness(createFixture("Date: 21 November 2026"));

  assert.deepEqual(result.missing_sections, ["date+signature"]);
  assert.equal(result.completeness_rate, 0);
});

test("date+signature completeness passes when both are present", async () => {
  const result = await completeness(
    createFixture("Date: 21 November 2026\nSignature: Applicant"),
  );

  assert.deepEqual(result.missing_sections, []);
  assert.equal(result.completeness_rate, 100);
});
