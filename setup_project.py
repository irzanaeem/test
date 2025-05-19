import os
import subprocess
import sys
import shutil

def check_node_installation():
    try:
        subprocess.run(["node", "--version"], capture_output=True, check=True)
        subprocess.run(["npm", "--version"], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("Error: Node.js and npm are required but not found!")
        print("Please install Node.js from: https://nodejs.org/")
        print("After installation, restart your terminal and try again.")
        return False

def install_dependencies():
    if not check_node_installation():
        return
    
    print("Installing backend dependencies...")
    os.chdir("server")
    subprocess.check_call(["npm", "install"])
    os.chdir("..")
    
    print("Installing frontend dependencies...")
    os.chdir("client")
    subprocess.check_call(["npm", "install"])
    os.chdir("..")

def reset_database():
    db_files = ["database.sqlite", "sessions.db"]
    for db_file in db_files:
        if os.path.exists(db_file):
            print(f"Deleting {db_file}...")
            os.remove(db_file)
    print("Database reset. If you have a seed script, run it now.")

def run_backend():
    if not check_node_installation():
        return
        
    print("Starting backend server...")
    os.chdir("server")
    subprocess.Popen(["npm", "run", "dev"])
    os.chdir("..")

def run_frontend():
    if not check_node_installation():
        return
        
    print("Starting frontend (Vite) dev server...")
    os.chdir("client")
    subprocess.Popen(["npm", "run", "dev"])
    os.chdir("..")

def main():
    print("==== Project Setup Script ====")
    print("1. Install dependencies")
    print("2. Run project")
    print("3. Reset database for fresh data entry")
    print("4. All of the above")
    choice = input("Choose an option (1/2/3/4): ").strip()

    if choice == "1":
        install_dependencies()
    elif choice == "2":
        run_backend()
        run_frontend()
    elif choice == "3":
        reset_database()
    elif choice == "4":
        install_dependencies()
        reset_database()
        run_backend()
        run_frontend()
    else:
        print("Invalid choice.")

if __name__ == "__main__":
    main() 