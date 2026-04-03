import { describe, it, expect, beforeEach, vi } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import {
  createFile,
  createDirectory,
  renamePath,
  deletePath,
  movePath,
  readFileContent,
  getGitBranch,
  isGitRepository,
} from "./fileOperations";
import type { FileNode } from "../state/types";

vi.mock("@tauri-apps/api/core");

const mockInvoke = invoke as ReturnType<typeof vi.fn>;

describe("fileOperations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createFile", () => {
    it("should call invoke with correct arguments", async () => {
      const mockFileNode: FileNode = {
        name: "test.txt",
        path: "/project/test.txt",
        is_dir: false,
      };
      mockInvoke.mockResolvedValue(mockFileNode);

      const result = await createFile("/project", "test.txt");

      expect(mockInvoke).toHaveBeenCalledWith("create_file", {
        parentPath: "/project",
        name: "test.txt",
      });
      expect(result).toEqual(mockFileNode);
    });
  });

  describe("createDirectory", () => {
    it("should call invoke with correct arguments", async () => {
      const mockDirNode: FileNode = {
        name: "newDir",
        path: "/project/newDir",
        is_dir: true,
        children: [],
      };
      mockInvoke.mockResolvedValue(mockDirNode);

      const result = await createDirectory("/project", "newDir");

      expect(mockInvoke).toHaveBeenCalledWith("create_directory", {
        parentPath: "/project",
        name: "newDir",
      });
      expect(result).toEqual(mockDirNode);
    });
  });

  describe("renamePath", () => {
    it("should call invoke with correct arguments", async () => {
      const mockFileNode: FileNode = {
        name: "renamed.txt",
        path: "/project/renamed.txt",
        is_dir: false,
      };
      mockInvoke.mockResolvedValue(mockFileNode);

      const result = await renamePath("/project/old.txt", "renamed.txt");

      expect(mockInvoke).toHaveBeenCalledWith("rename_path", {
        oldPath: "/project/old.txt",
        newName: "renamed.txt",
      });
      expect(result).toEqual(mockFileNode);
    });
  });

  describe("deletePath", () => {
    it("should call invoke with correct arguments", async () => {
      mockInvoke.mockResolvedValue(undefined);

      await deletePath("/project/file.txt");

      expect(mockInvoke).toHaveBeenCalledWith("delete_path", {
        path: "/project/file.txt",
      });
    });
  });

  describe("movePath", () => {
    it("should call invoke with correct arguments", async () => {
      const mockFileNode: FileNode = {
        name: "moved.txt",
        path: "/dest/moved.txt",
        is_dir: false,
      };
      mockInvoke.mockResolvedValue(mockFileNode);

      const result = await movePath("/source/moved.txt", "/dest");

      expect(mockInvoke).toHaveBeenCalledWith("move_path", {
        sourcePath: "/source/moved.txt",
        destDir: "/dest",
      });
      expect(result).toEqual(mockFileNode);
    });
  });

  describe("readFileContent", () => {
    it("should call invoke and return file content", async () => {
      const content = "file content here";
      mockInvoke.mockResolvedValue(content);

      const result = await readFileContent("/project/file.txt");

      expect(mockInvoke).toHaveBeenCalledWith("read_file_content", {
        path: "/project/file.txt",
      });
      expect(result).toEqual(content);
    });
  });

  describe("getGitBranch", () => {
    it("should return branch name on success", async () => {
      mockInvoke.mockResolvedValue("feature-branch");

      const result = await getGitBranch("/project");

      expect(mockInvoke).toHaveBeenCalledWith("get_git_branch", {
        path: "/project",
      });
      expect(result).toBe("feature-branch");
    });

    it("should return null when invoke throws", async () => {
      mockInvoke.mockRejectedValue(new Error("Not a git repo"));

      const result = await getGitBranch("/project");

      expect(result).toBeNull();
    });

    it("should return empty string when branch is empty string", async () => {
      mockInvoke.mockResolvedValue("");

      const result = await getGitBranch("/project");

      expect(result).toBe("");
    });
  });

  describe("isGitRepository", () => {
    it("should return true when path is git repository", async () => {
      mockInvoke.mockResolvedValue(true);

      const result = await isGitRepository("/project");

      expect(mockInvoke).toHaveBeenCalledWith("is_git_repository", {
        path: "/project",
      });
      expect(result).toBe(true);
    });

    it("should return false when invoke throws", async () => {
      mockInvoke.mockRejectedValue(new Error("Path does not exist"));

      const result = await isGitRepository("/nonexistent");

      expect(result).toBe(false);
    });

    it("should return false when result is false", async () => {
      mockInvoke.mockResolvedValue(false);

      const result = await isGitRepository("/project");

      expect(result).toBe(false);
    });
  });
});