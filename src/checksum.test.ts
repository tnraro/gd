import { expect, test } from "bun:test";
import { checksum } from "./checksum";

test("checksum", () => {
  expect(checksum("a")).toBeString();
});
