CREATE TABLE donors (
    id VARCHAR(80) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    city VARCHAR(120) NOT NULL,
    country VARCHAR(120) NOT NULL,
    kind VARCHAR(40) NOT NULL,
    tier VARCHAR(40) NOT NULL,
    status VARCHAR(40) NOT NULL,
    total_given DECIMAL(19, 2) NOT NULL DEFAULT 0,
    donation_count INTEGER NOT NULL DEFAULT 0,
    first_gift_date TIMESTAMP NOT NULL,
    last_gift_date TIMESTAMP NOT NULL,
    joined_at TIMESTAMP NOT NULL,
    communication_consent BOOLEAN NOT NULL DEFAULT TRUE,
    notes VARCHAR(1000)
);

-- All write paths normalize email to lowercase before persistence.
CREATE UNIQUE INDEX ux_donors_email ON donors (email);
CREATE INDEX ix_donors_status ON donors (status);

CREATE TABLE donor_tags (
    donor_id VARCHAR(80) NOT NULL,
    tag VARCHAR(100) NOT NULL,
    CONSTRAINT fk_donor_tags_donor FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE
);

CREATE TABLE campaigns (
    id VARCHAR(80) PRIMARY KEY,
    name VARCHAR(180) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    goal DECIMAL(19, 2) NOT NULL,
    raised DECIMAL(19, 2) NOT NULL DEFAULT 0,
    donor_count INTEGER NOT NULL DEFAULT 0,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(40) NOT NULL,
    accent VARCHAR(20) NOT NULL
);

CREATE TABLE donations (
    id VARCHAR(80) PRIMARY KEY,
    donor_id VARCHAR(80) NOT NULL,
    campaign_id VARCHAR(80) NOT NULL,
    amount DECIMAL(19, 2) NOT NULL,
    donation_date TIMESTAMP NOT NULL,
    status VARCHAR(40) NOT NULL,
    payment_method VARCHAR(60) NOT NULL,
    channel VARCHAR(60) NOT NULL,
    recurring BOOLEAN NOT NULL DEFAULT FALSE,
    reference VARCHAR(80) NOT NULL,
    note VARCHAR(500),
    CONSTRAINT fk_donations_donor FOREIGN KEY (donor_id) REFERENCES donors(id),
    CONSTRAINT fk_donations_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);

CREATE UNIQUE INDEX ux_donations_reference ON donations (reference);
CREATE INDEX ix_donations_donor ON donations (donor_id);
CREATE INDEX ix_donations_campaign ON donations (campaign_id);
CREATE INDEX ix_donations_date ON donations (donation_date);
