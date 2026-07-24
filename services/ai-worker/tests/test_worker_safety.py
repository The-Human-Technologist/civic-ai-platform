import builtins
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

WORKER_ROOT = Path(__file__).resolve().parents[1]
if str(WORKER_ROOT) not in sys.path:
    sys.path.insert(0, str(WORKER_ROOT))

from app.frame_extractor import extract_frames_with_opencv
from app.detectors import CIVIC_LABEL_MAP, COCO_VEHICLES
from app.privacy_masker import (
    PrivacyMaskingError,
    mask_object_regions,
    mask_privacy_regions,
    normalize_privacy_box,
)


class WorkerSafetyTests(unittest.TestCase):
    def test_privacy_box_is_clipped_to_frame(self):
        self.assertEqual(
            normalize_privacy_box({"x": 90, "y": 40, "width": 30, "height": 20}, 100, 50),
            (90, 40, 10, 10),
        )

    def test_empty_privacy_box_is_ignored(self):
        self.assertIsNone(
            normalize_privacy_box({"x": 10, "y": 10, "width": 0, "height": 5}, 100, 50)
        )

    def test_masking_fails_closed_without_opencv(self):
        original_import = builtins.__import__

        def blocked_import(name, *args, **kwargs):
            if name == "cv2":
                raise ImportError("blocked for test")
            return original_import(name, *args, **kwargs)

        with patch("builtins.__import__", side_effect=blocked_import):
            with self.assertRaises(PrivacyMaskingError):
                mask_privacy_regions(object(), strict=True)

    def test_frame_extractor_rejects_missing_input(self):
        with self.assertRaises(FileNotFoundError):
            extract_frames_with_opencv("missing-authorized-clip.mp4")

    def test_specialist_labels_are_explicit(self):
        self.assertEqual(CIVIC_LABEL_MAP["pothole"], "pothole")
        self.assertEqual(CIVIC_LABEL_MAP["water"], "waterlogging")
        self.assertNotIn("helmet", CIVIC_LABEL_MAP)

    def test_vehicle_allowlist_is_bounded(self):
        self.assertIn("car", COCO_VEHICLES)
        self.assertIn("motorcycle", COCO_VEHICLES)
        self.assertNotIn("face", COCO_VEHICLES)

    def test_object_masking_fails_closed_without_opencv(self):
        original_import = builtins.__import__

        def blocked_import(name, *args, **kwargs):
            if name == "cv2":
                raise ImportError("blocked for test")
            return original_import(name, *args, **kwargs)

        with patch("builtins.__import__", side_effect=blocked_import):
            with self.assertRaises(PrivacyMaskingError):
                mask_object_regions(object(), [{"x": 0, "y": 0, "width": 5, "height": 5}])


if __name__ == "__main__":
    unittest.main()
