use md5::{Md5, Digest};
use rayon::prelude::*;
use std::collections::HashMap;
use std::fs::{self, File};
use std::io::{BufRead, BufReader, BufWriter, Write};
use std::path::Path;
use std::sync::Mutex;

fn main() {
    let wordlist_dir = Path::new("..");
    let output_file = wordlist_dir.join("precomputed_hashes.txt");

    let hashes: Mutex<HashMap<String, String>> = Mutex::new(HashMap::new());

    // Find all .txt files except the output
    let txt_files: Vec<_> = fs::read_dir(wordlist_dir)
        .expect("Failed to read wordlist directory")
        .filter_map(|e| e.ok())
        .filter(|e| {
            let path = e.path();
            path.extension().map_or(false, |ext| ext == "txt")
                && path.file_name().map_or(false, |n| n != "precomputed_hashes.txt")
        })
        .collect();

    let total_files = txt_files.len();

    for (idx, entry) in txt_files.iter().enumerate() {
        let path = entry.path();
        let filename = path.file_name().unwrap().to_string_lossy();
        eprintln!("[{}/{}] Processing {}...", idx + 1, total_files, filename);

        let file = File::open(&path).expect("Failed to open file");
        let reader = BufReader::new(file);

        // Collect lines for parallel processing
        let lines: Vec<String> = reader
            .lines()
            .filter_map(|l| l.ok())
            .filter(|l| !l.is_empty())
            .collect();

        let batch_hashes: Vec<(String, String)> = lines
            .par_iter()
            .map(|password| {
                let mut hasher = Md5::new();
                hasher.update(password.as_bytes());
                let hash = format!("{:x}", hasher.finalize());
                (hash, password.clone())
            })
            .collect();

        let mut map = hashes.lock().unwrap();
        for (hash, password) in batch_hashes {
            map.entry(hash).or_insert(password);
        }

        eprintln!("  -> {} unique hashes so far", map.len());
    }

    let map = hashes.into_inner().unwrap();
    eprintln!("Writing {} unique hashes to output...", map.len());

    let file = File::create(&output_file).expect("Failed to create output file");
    let mut writer = BufWriter::new(file);

    for (hash, password) in &map {
        writeln!(writer, "{}:{}", hash, password).expect("Failed to write");
    }

    eprintln!("Done! Output: {}", output_file.display());
}
