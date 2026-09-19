 import java.time.LocalDate; import java.util.ArrayList; import java.util.List; import java.util.Scanner;

public class NonProfitOrganisation {

// Inner class for Donor
static class Donor {
    private String name;
    private String email;
    private List<Donation> donations = new ArrayList<>();

    public Donor(String name, String email) {
        this.name = name;
        this.email = email;
    }

    public void addDonation(Donation donation) {
        donations.add(donation);
    }

    public double getTotalDonations() {
        return donations.stream().mapToDouble(Donation::getAmount).sum();
    }

    // Getters
    public String getName() { return name; }
    public String getEmail() { return email; }
    public List<Donation> getDonations() { return donations; }
}

// Inner class for Donation
static class Donation {
    private double amount;
    private String category;
    private LocalDate date;

    public Donation(double amount, String category, LocalDate date) {
        this.amount = amount;
        this.category = category;
        this.date = date;
    }

    // Getters
    public double getAmount() { return amount; }
    public String getCategory() { return category; }
    public LocalDate getDate() { return date; }
}

// Main application logic
private static List<Donor> donors = new ArrayList<>();
private static Scanner scanner = new Scanner(System.in);

public static void main(String[] args) {
    boolean running = true;
    while (running) {
        System.out.println("\nNonprofit Donation Tracker Menu:");
        System.out.println("1. Add Donor");
        System.out.println("2. Add Donation");
        System.out.println("3. View Reports");
        System.out.println("4. Exit");
        System.out.print("Enter your choice: ");

        try {
            int choice = Integer.parseInt(scanner.nextLine().trim());
            switch (choice) {
                case 1 -> addDonor();
                case 2 -> addDonation();
                case 3 -> viewReports();
                case 4 -> running = false;
                default -> System.out.println("Invalid choice. Please try again.");
            }
        } catch (NumberFormatException e) {
            System.out.println("Invalid input. Please enter a number.");
        }
    }
    scanner.close();
    System.out.println("Application closed.");
}

private static void addDonor() {
    System.out.print("Enter donor name: ");
    String name = scanner.nextLine().trim();
    System.out.print("Enter donor email: ");
    String email = scanner.nextLine().trim();
    donors.add(new Donor(name, email));
    System.out.println("Donor added successfully.");
}

private static void addDonation() {
    if (donors.isEmpty()) {
        System.out.println("No donors available. Please add a donor first.");
        return;
    }

    System.out.print("Enter donor name: ");
    String name = scanner.nextLine().trim();
    Donor donor = donors.stream()
            .filter(d -> d.getName().equalsIgnoreCase(name))
            .findFirst()
            .orElse(null);

    if (donor == null) {
        System.out.println("Donor not found. Check the name and try again.");
        return;
    }

    try {
        System.out.print("Enter donation amount: ");
        double amount = Double.parseDouble(scanner.nextLine().trim());

        System.out.print("Enter category (e.g., cash, goods): ");
        String category = scanner.nextLine().trim();

        Donation donation = new Donation(amount, category, LocalDate.now());
        donor.addDonation(donation);
        System.out.println("Donation added successfully.");
    } catch (NumberFormatException e) {
        System.out.println("Invalid amount. Please enter a numeric value.");
    }
}

private static void viewReports() {
    if (donors.isEmpty()) {
        System.out.println("No donors or donations yet.");
        return;
    }

    double grandTotal = 0;
    System.out.println("\nDonation Reports:");
    for (Donor donor : donors) {
        double donorTotal = donor.getTotalDonations();
        System.out.println(donor.getName() + " (" + donor.getEmail() + "): $" + donorTotal);
        grandTotal += donorTotal;
    }
    System.out.println("Grand Total Donations: $" + grandTotal);
}
}
